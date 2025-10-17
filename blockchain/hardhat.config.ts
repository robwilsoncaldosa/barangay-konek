// import { HardhatUserConfig } from "hardhat/config";
// import "@nomicfoundation/hardhat-toolbox";
// import * as dotenv from "dotenv";
// dotenv.config();

// const config: HardhatUserConfig = {
//   networks: {
//     hardhat: {
//       type: "edr-simulated", // ✅ required in v3+
//       chainId: Number(process.env.SEPOLIA_CHAIN_ID) || 31337,
//     },
//     sepolia: {
//       type: "http", // ✅ for external network
//       url: process.env.SEPOLIA_RPC_URL || "",
//       accounts: process.env.SEPOLIA_PRIVATE_KEY
//         ? [process.env.SEPOLIA_PRIVATE_KEY]
//         : [],
//     },
//   },
//   solidity: {
//     version: "0.8.28",
//     settings: {
//       optimizer: { enabled: true, runs: 200 },
//     },
//   },
// };

// export default config;
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.SEPOLIA_PRIVATE_KEY ? [process.env.SEPOLIA_PRIVATE_KEY] : [],
    },
  },
};

export default config;
