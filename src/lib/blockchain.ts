// src/lib/blockchain.ts
import { ethers } from "ethers";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const CONTRACT_ABI = [
  "function register(string _name, string _role) public",
  "function getUser(address _user) public view returns (tuple(string name, string role, address userAddress, uint256 createdAt))",
  "function registerRequest(uint256 certificateId, address residentAddress, string purpose, string documentType) public"
];

// --- Wallet connection ---
export async function connectWallet(): Promise<string> {
  if (typeof window === "undefined") throw new Error("No window object");
  if (!window.ethereum) throw new Error("MetaMask not detected");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  return accounts[0]; // user's wallet address
}

// --- Register a user ---
export async function registerUserOnChain(name: string, role: string): Promise<string> {
  if (!window.ethereum) throw new Error("MetaMask not detected");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  const tx = await contract.register(name, role);
  await tx.wait();
  return tx.hash;
}

// --- Get contract instance ---
export async function getContract() {
  if (typeof window === "undefined") throw new Error("No window object");
  if (!window.ethereum) throw new Error("MetaMask not detected");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// --- Register a request ---
export async function registerRequestOnChain(
  certificateId: number,
  residentAddress: string,
  purpose: string,
  documentType: string
): Promise<string> {
  if (!window.ethereum) throw new Error("MetaMask not installed");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  const tx = await contract.registerRequest(certificateId, residentAddress, purpose, documentType);
  await tx.wait();

  console.log("Request registered on chain:", tx.hash);
  return tx.hash;
}
