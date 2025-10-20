import { ethers } from "ethers";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const CONTRACT_ABI = [
  "function addRequest(uint256 certificateId, uint256 residentId, string documentType, string purpose, string priority) public",
  "function getRequests() public view returns (tuple(uint256 id, uint256 certificateId, uint256 residentId, string documentType, string purpose, string priority, uint256 timestamp)[])"
];

// --- Connect MetaMask ---
export async function connectWallet(): Promise<string> {
  if (!window.ethereum) throw new Error("MetaMask not detected");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  return accounts[0];
}

// --- Get contract instance ---
export async function getContract() {
  if (!window.ethereum) throw new Error("MetaMask not detected");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// --- Add a new certificate request ---
// export async function addCertificateRequest(
//   certificateId: number,
//   residentId: number,
//   documentType: string,
//   purpose: string,
//   priority: string
// ): Promise<string> {
//   const contract = await getContract();

//   // Optional: validate inputs
//   if (!certificateId || !residentId || !documentType || !purpose || !priority) {
//     throw new Error("Invalid arguments for addCertificateRequest");
//   }

//   // Call the contract
//   const tx = await contract.addRequest(certificateId, residentId, documentType, purpose, priority);

//   // Wait for confirmation
//   const receipt = await tx.wait();
//   console.log("receipt: ", receipt);
//   console.log("Transaction successful:", receipt.blockHash);

//   return receipt.transactionHash;
// }
export async function addCertificateRequest(
  certificateId: number,
  residentId: number,
  documentType: string,
  purpose: string,
  priority: string
): Promise<string> {
  const contract = await getContract();

  if (!certificateId || !residentId || !documentType || !purpose || !priority) {
    throw new Error("Invalid arguments for addCertificateRequest");
  }

  // Call the contract
  const tx = await contract.addRequest(certificateId, residentId, documentType, purpose, priority);

  // Wait for confirmation
  const receipt = await tx.wait();
  console.log("receipt: ", receipt);
  console.log("Transaction successful, blockHash:", receipt.blockHash);

  // **tx.hash is the transaction hash you want**
  return tx.hash;
}


// --- Get all certificate requests ---
export async function getCertificateRequests() {
  const contract = await getContract();
  const requests = await contract.getRequests();
  return requests;
}
