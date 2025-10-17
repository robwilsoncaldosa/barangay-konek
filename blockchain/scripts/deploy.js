import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  const RegisterUser = await ethers.getContractFactory("RegisterUser");
  console.log("🚀 Deploying RegisterUser...");

  const contract = await RegisterUser.deploy();
  await contract.waitForDeployment();

  console.log("✅ Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
