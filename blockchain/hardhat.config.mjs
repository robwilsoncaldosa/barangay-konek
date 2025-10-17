import { config as dotenvConfig } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";

dotenvConfig();

export default {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "",
      accounts: process.env.NEXT_PUBLIC_SEPOLIA_PRIVATE_KEY ? [process.env.NEXT_PUBLIC_SEPOLIA_PRIVATE_KEY] : [],
    },
  },
};
