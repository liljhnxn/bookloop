import hre from "hardhat";
const { ethers } = hre;
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("--------------------------------------------------");
  console.log("Deploying BookLoop contract with account:", deployer ? deployer.address : "No signer");

  if (deployer) {
    const balance = await ethers.provider.getBalance(deployer.address);
    const feeData = await ethers.provider.getFeeData();
    console.log("Account balance:", ethers.formatEther(balance), "BOT");
    console.log("Network gas price:", feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") + " gwei" : "standard");
  }

  const BookLoop = await ethers.getContractFactory("BookLoop");
  console.log("Broadcasting deployment transaction...");
  const bookLoop = await BookLoop.deploy();

  await bookLoop.waitForDeployment();
  const address = await bookLoop.getAddress();

  const deployReceipt = await bookLoop.deploymentTransaction()?.wait();
  if (deployReceipt) {
    const gasUsed = deployReceipt.gasUsed;
    const gasPrice = deployReceipt.gasPrice || 0n;
    const totalCost = gasUsed * gasPrice;
    console.log("Gas used:", gasUsed.toString());
    console.log("Deployment fee paid:", ethers.formatEther(totalCost), "BOT");
  }

  console.log("✅ BookLoop deployed successfully to:", address);
  console.log("Network:", (await ethers.provider.getNetwork()).name, "(chainId:", (await ethers.provider.getNetwork()).chainId.toString() + ")");
  console.log("--------------------------------------------------");

  // Save the contract address and ABI info for frontend
  const deployedInfo = {
    address: address,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployedAt: new Date().toISOString(),
  };

  const outputDir = path.join(process.cwd(), "src/config");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, "deployed-contract.json"),
    JSON.stringify(deployedInfo, null, 2)
  );

  // Update .env file with the deployed contract address
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf-8");
    if (envContent.includes("NEXT_PUBLIC_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
        `NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS=${address}\n`;
    }
    fs.writeFileSync(envPath, envContent, "utf-8");
    console.log("Updated NEXT_PUBLIC_CONTRACT_ADDRESS in .env");
  }

  console.log("Saved deployed contract config to src/config/deployed-contract.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
