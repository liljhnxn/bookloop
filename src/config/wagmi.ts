import { http, createConfig } from "wagmi";
import { defineChain } from "viem";
import { injected } from "wagmi/connectors";

export const botchain = defineChain({
  id: 968,
  name: "Botchain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Bohr",
    symbol: "BOHR",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.bohr.life"],
    },
    public: {
      http: ["https://rpc.bohr.life"],
    },
  },
  blockExplorers: {
    default: {
      name: "BohrScan",
      url: "https://scan.bohr.life",
    },
  },
  testnet: true,
});

export const hardhatLocal = defineChain({
  id: 31337,
  name: "Hardhat Localhost",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [botchain, hardhatLocal],
  connectors: [
    injected(),
  ],
  transports: {
    [botchain.id]: http("https://rpc.bohr.life"),
    [hardhatLocal.id]: http("http://127.0.0.1:8545"),
  },
  ssr: true,
});

