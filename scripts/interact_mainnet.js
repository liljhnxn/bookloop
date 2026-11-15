require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  const rpcUrl = process.env.BOTCHAIN_MAINNET_RPC_URL || 'https://rpc.botchain.ai';
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x83963800D206199e472816CCA3Fa8d5bA4C9E751';
  const artifactPath = path.join(__dirname, '../artifacts/contracts/BookLoop.sol/BookLoop.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  const pk1 = process.env.PRIVATE_KEY;
  const pk2 = process.env.PRIVATE_KEY_2;
  const pk3 = process.env.PRIVATE_KEY_3;

  if (!pk1 || !pk2 || !pk3) {
    throw new Error('Please configure PRIVATE_KEY, PRIVATE_KEY_2, and PRIVATE_KEY_3 in .env');
  }

  const wallet1 = new ethers.Wallet(pk1, provider);
  const wallet2 = new ethers.Wallet(pk2, provider);
  const wallet3 = new ethers.Wallet(pk3, provider);

  const contract1 = new ethers.Contract(contractAddress, artifact.abi, wallet1);
  const contract2 = new ethers.Contract(contractAddress, artifact.abi, wallet2);
  const contract3 = new ethers.Contract(contractAddress, artifact.abi, wallet3);

  console.log('=== Checking Balances ===');
  const b1 = await provider.getBalance(wallet1.address);
  const b2 = await provider.getBalance(wallet2.address);
  const b3 = await provider.getBalance(wallet3.address);
  console.log(`Wallet 1 (${wallet1.address}): ${ethers.formatEther(b1)} BOT`);
  console.log(`Wallet 2 (${wallet2.address}): ${ethers.formatEther(b2)} BOT`);
  console.log(`Wallet 3 (${wallet3.address}): ${ethers.formatEther(b3)} BOT`);

  const initialBooks = await contract1.totalBooksCount();
  console.log(`Initial total books: ${initialBooks.toString()}`);

  const results = [];
  const gasPrice = ethers.parseUnits('20', 'gwei');

  // Interaction 1: Wallet 1 lists Book #1
  console.log('\n--- Interaction 1 (Wallet 1): listBook #1 ---');
  const tx1 = await contract1.listBook(
    'The Pragmatic Programmer',
    'David Thomas & Andrew Hunt',
    'Classic software engineering handbook on craftsman approaches, career growth, and modular architecture.',
    'Technology',
    { gasPrice, gasLimit: 400000 }
  );
  console.log(`Tx1 sent: ${tx1.hash}`);
  const receipt1 = await tx1.wait();
  console.log(`Tx1 confirmed in block ${receipt1.blockNumber} (Gas used: ${receipt1.gasUsed.toString()})`);
  const bookId1 = (await contract1.totalBooksCount()).toString();
  results.push({
    interaction: 1,
    action: 'listBook',
    wallet: wallet1.address,
    txHash: tx1.hash,
    blockNumber: receipt1.blockNumber,
    gasUsed: receipt1.gasUsed.toString(),
    details: `Book #${bookId1}: The Pragmatic Programmer`
  });

  // Interaction 2: Wallet 2 claims Book #1
  console.log('\n--- Interaction 2 (Wallet 2): claimBook #1 ---');
  const tx2 = await contract2.claimBook(bookId1, { gasPrice, gasLimit: 400000 });
  console.log(`Tx2 sent: ${tx2.hash}`);
  const receipt2 = await tx2.wait();
  console.log(`Tx2 confirmed in block ${receipt2.blockNumber} (Gas used: ${receipt2.gasUsed.toString()})`);
  results.push({
    interaction: 2,
    action: 'claimBook',
    wallet: wallet2.address,
    txHash: tx2.hash,
    blockNumber: receipt2.blockNumber,
    gasUsed: receipt2.gasUsed.toString(),
    details: `Claimed Book #${bookId1}`
  });

  // Interaction 3: Wallet 1 marks Book #1 as collected
  console.log('\n--- Interaction 3 (Wallet 1): markAsCollected #1 ---');
  const tx3 = await contract1.markAsCollected(bookId1, { gasPrice, gasLimit: 400000 });
  console.log(`Tx3 sent: ${tx3.hash}`);
  const receipt3 = await tx3.wait();
  console.log(`Tx3 confirmed in block ${receipt3.blockNumber} (Gas used: ${receipt3.gasUsed.toString()})`);
  results.push({
    interaction: 3,
    action: 'markAsCollected',
    wallet: wallet1.address,
    txHash: tx3.hash,
    blockNumber: receipt3.blockNumber,
    gasUsed: receipt3.gasUsed.toString(),
    details: `Marked Book #${bookId1} as collected`
  });

  // Interaction 4: Wallet 2 lists Book #2
  console.log('\n--- Interaction 4 (Wallet 2): listBook #2 ---');
  const tx4 = await contract2.listBook(
    'Atomic Habits',
    'James Clear',
    'Practical strategies to form good daily habits, break bad ones, and master tiny behaviors.',
    'Self-Help',
    { gasPrice, gasLimit: 400000 }
  );
  console.log(`Tx4 sent: ${tx4.hash}`);
  const receipt4 = await tx4.wait();
  console.log(`Tx4 confirmed in block ${receipt4.blockNumber} (Gas used: ${receipt4.gasUsed.toString()})`);
  const bookId2 = (await contract2.totalBooksCount()).toString();
  results.push({
    interaction: 4,
    action: 'listBook',
    wallet: wallet2.address,
    txHash: tx4.hash,
    blockNumber: receipt4.blockNumber,
    gasUsed: receipt4.gasUsed.toString(),
    details: `Book #${bookId2}: Atomic Habits`
  });

  // Interaction 5: Wallet 3 claims Book #2
  console.log('\n--- Interaction 5 (Wallet 3): claimBook #2 ---');
  const tx5 = await contract3.claimBook(bookId2, { gasPrice, gasLimit: 400000 });
  console.log(`Tx5 sent: ${tx5.hash}`);
  const receipt5 = await tx5.wait();
  console.log(`Tx5 confirmed in block ${receipt5.blockNumber} (Gas used: ${receipt5.gasUsed.toString()})`);
  results.push({
    interaction: 5,
    action: 'claimBook',
    wallet: wallet3.address,
    txHash: tx5.hash,
    blockNumber: receipt5.blockNumber,
    gasUsed: receipt5.gasUsed.toString(),
    details: `Claimed Book #${bookId2}`
  });

  console.log('\n=== Summary of Interactions ===');
  console.log(JSON.stringify(results, null, 2));

  const totalListed = await contract1.totalBooksListed();
  const totalShared = await contract1.totalBooksShared();
  console.log('\n=== Final BookLoop Stats ===');
  console.log(`Total Books Listed: ${totalListed.toString()}`);
  console.log(`Total Books Shared: ${totalShared.toString()}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
