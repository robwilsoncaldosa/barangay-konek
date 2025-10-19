import { config as dotenvConfig } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";

dotenvConfig({ path: ".env.local" }); // 👈 ensure this points to the correct file

export default {
  solidity: "0.8.28",
  networks: {
    liskSepolia: {
      url: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "",
      accounts: process.env.NEXT_PUBLIC_SEPOLIA_PRIVATE_KEY
        ? [process.env.NEXT_PUBLIC_SEPOLIA_PRIVATE_KEY]
        : [],
    },
  },
};
