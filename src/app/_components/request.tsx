"use client";

import { useEffect, useState } from "react";
import { connectWallet, addCertificateRequest } from "@/lib/blockchain";

interface RequestData {
    id: number;
    mCertificateId: number;
    resident_id: number;
    purpose: string;
    document_type: string;
    request_date: string;
    priority: string;
    status: string;
    payment_status: string;
    created_at: string;
    updated_at: string;
    email: string;
    tx_hash?: string;
}

const RequestPage = () => {
    const [requests, setRequests] = useState<RequestData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [hasMetaMask, setHasMetaMask] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/requests");
            const data = await res.json();
            if (data.success) setRequests(data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchRequests();
        if (typeof window !== "undefined" && window.ethereum) setHasMetaMask(true);
    }, []);

    const openModal = (req: RequestData) => {
        setSelectedRequest(req);
        setFile(null);
        setMessage("");
        setModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected && selected.type !== "application/pdf") {
            alert("Only PDF files are allowed");
            e.target.value = "";
            return;
        }
        setFile(selected || null);
    };

    const handleSubmit = async () => {
        if (!file || !selectedRequest) return;

        const email = selectedRequest.email;
        if (!email) {
            setMessage("❌ Resident email not found!");
            return;
        }

        setMessage("📤 Uploading PDF...");

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("request_id", selectedRequest.id.toString());

            let tx_hash = "";
            if (hasMetaMask) {
                setMessage("⏳ Preparing blockchain registration...");
                const walletAddress = await connectWallet();
                console.log("Wallet connected:", walletAddress);

                tx_hash = await addCertificateRequest(
                    selectedRequest.mCertificateId,
                    Number(selectedRequest.resident_id),
                    selectedRequest.document_type,
                    selectedRequest.purpose,
                    selectedRequest.priority
                );

                console.log("Blockchain transaction hash:", tx_hash);
            }

            // Add blockchain info to FormData
            formData.append("blockchain", hasMetaMask ? "1" : "0");
            if (tx_hash) formData.append("tx_hash", tx_hash);

            // Upload PDF + optional blockchain info
            const uploadRes = await fetch("/api/requests", { method: "PUT", body: formData });
            const uploadData = await uploadRes.json();

            if (!uploadData.success) {
                setMessage(`❌ Upload failed: ${uploadData.message}`);
                return;
            }

            console.log("PDF uploaded successfully:", uploadData.data);
            setMessage("✅ PDF uploaded successfully!");

            // Update local state
            setRequests(prev => prev.map(r =>
                r.id === selectedRequest.id ? { ...r, tx_hash: tx_hash || r.tx_hash } : r
            ));

            setModalOpen(false);
            fetchRequests();
        } catch (err) {
            console.error("Unexpected error:", err);
            setMessage("❌ Unexpected error occurred. Check console.");
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Requests</h1>
            {!hasMetaMask && <p className="text-blue-600 mt-2">⚠️ MetaMask not detected. Blockchain skipped.</p>}
            {loading ? <p>Loading...</p> :
                requests.length === 0 ? <p>No requests found.</p> :
                    <div className="overflow-x-auto text-black">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th>ID</th><th>Certificate ID</th><th>Resident ID</th><th>Purpose</th>
                                    <th>Document Type</th><th>Request Date</th><th>Priority</th><th>Status</th>
                                    <th>Payment</th><th>Tx Hash</th><th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(req => (
                                    <tr key={req.id} className="text-center border-b">
                                        <td>{req.id}</td>
                                        <td>{req.mCertificateId}</td>
                                        <td>{req.resident_id}</td>
                                        <td>{req.purpose}</td>
                                        <td>{req.document_type}</td>
                                        <td>{req.request_date}</td>
                                        <td>{req.priority}</td>
                                        <td>{req.status}</td>
                                        <td>{req.payment_status}</td>
                                        <td>
                                            {req.tx_hash
                                                ? <a href={`https://sepolia.etherscan.io/tx/${req.tx_hash}`} target="_blank" rel="noopener noreferrer">{req.tx_hash.slice(0, 10)}...</a>
                                                : "—"}
                                        </td>
                                        <td>
                                            <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={() => openModal(req)}>Update</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
            }

            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Upload PDF for Request #{selectedRequest?.id}</h2>
                        <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-4" />
                        <div className="flex justify-end space-x-2">
                            <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSubmit} disabled={!file}>Submit</button>
                        </div>
                        {message && <p className="mt-2 text-sm">{message}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestPage;
