const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying CertificateRequests...");
  const CertificateRequests = await ethers.getContractFactory("CertificateRequests");
  const contract = await CertificateRequests.deploy();
  await contract.waitForDeployment();
  console.log("✅ Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
