"use client";

import { useEffect, useState } from "react";
import { connectWallet, registerRequestOnChain } from "@/lib/blockchain"; // import your blockchain functions

interface RequestData {
    id: number;
    m_certificate_id: number;
    resident_id: number;
    purpose: string;
    document_type: string;
    request_date: string;
    priority: string;
    status: string;
    payment_status: string;
    created_at: string;
    updated_at: string;
    email: string; // make sure your API returns resident email
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
            if (data.success) {
                setRequests(data.data);
                console.log('data', data.data);
            } else {
                console.error(data.message);
            }
        } catch (err) {
            console.error("Error fetching requests:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        if (typeof window !== "undefined" && window.ethereum) {
            setHasMetaMask(true);
        }
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

    // const handleSubmit = async () => {
    //     if (!file || !selectedRequest) return;

    //     const email = selectedRequest.email;
    //     if (!email) {
    //         setMessage("❌ Resident email not found!");
    //         return;
    //     }

    //     const formData = new FormData();
    //     formData.append("file", file);
    //     formData.append("request_id", selectedRequest.id.toString());
    //     formData.append("email", email);

    //     setMessage("Uploading PDF and sending email...");

    //     try {
    //         // Step 1: Send file + update Supabase
    //         const res = await fetch("/api/requests", { method: "PUT", body: formData });
    //         const data = await res.json();

    //         if (!data.success) {
    //             setMessage(`❌ ${data.message}`);
    //             return;
    //         }

    //         setMessage("✅ File sent successfully! Registering on blockchain...");

    //         // Step 2: Connect MetaMask wallet
    //         const walletAddress = await connectWallet();

    //         // Step 3: Register request on blockchain
    //         await registerRequestOnChain(
    //             selectedRequest.m_certificate_id,
    //             walletAddress,
    //             selectedRequest.purpose,
    //             file.name
    //         );

    //         setMessage("✅ Request successfully registered on blockchain!");
    //         setModalOpen(false);
    //         fetchRequests(); // refresh table

    //     } catch (err) {
    //         console.error(err);
    //         setMessage("❌ Unexpected error occurred");
    //     }
    // };
    const handleSubmit = async () => {
        if (!file || !selectedRequest) return;

        const email = selectedRequest.email;
        if (!email) {
            setMessage("❌ Resident email not found!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("request_id", selectedRequest.id.toString());
        formData.append("email", email);

        setMessage("📤 Uploading PDF and sending email...");

        try {
            // Step 1: Upload + update Supabase
            const res = await fetch("/api/requests", { method: "PUT", body: formData });
            const data = await res.json();

            if (!data.success) {
                setMessage(`❌ ${data.message}`);
                return;
            }

            setMessage("✅ File uploaded and email sent!");

            // Step 2: Register on blockchain (optional)
            if (hasMetaMask) {
                try {
                    setMessage("🔗 Connecting MetaMask...");
                    const walletAddress = await connectWallet();

                    setMessage("🪙 Registering request on blockchain...");
                    await registerRequestOnChain(
                        selectedRequest.id,
                        walletAddress,
                        selectedRequest.purpose,
                        file.name
                    );

                    setMessage("✅ Request registered successfully on blockchain!");
                } catch (blockchainErr) {
                    console.error(blockchainErr);
                    setMessage("⚠️ Upload succeeded, but blockchain registration failed.");
                }
            } else {
                setMessage("⚠️ MetaMask not detected — skipping blockchain registration.");
            }

            setModalOpen(false);
            fetchRequests(); // refresh table
        } catch (err) {
            console.error(err);
            setMessage("❌ Unexpected error occurred");
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Requests</h1>
            {!hasMetaMask && (
                <p className="text-blue-600 mt-2">
                    ⚠️ MetaMask not detected. Uploads will work, but blockchain recording is skipped.
                </p>
            )}
            {loading ? (
                <p>Loading...</p>
            ) : requests.length === 0 ? (
                <p>No requests found.</p>
            ) : (
                <div className="overflow-x-auto text-black">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2 border">ID</th>
                                <th className="px-4 py-2 border">Certificate ID</th>
                                <th className="px-4 py-2 border">Resident ID</th>
                                <th className="px-4 py-2 border">Purpose</th>
                                <th className="px-4 py-2 border">Document Type</th>
                                <th className="px-4 py-2 border">Request Date</th>
                                <th className="px-4 py-2 border">Priority</th>
                                <th className="px-4 py-2 border">Status</th>
                                <th className="px-4 py-2 border">Payment</th>
                                <th className="px-4 py-2 border">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr key={req.id} className="text-center border-b">
                                    <td className="px-4 py-2 border">{req.id}</td>
                                    <td className="px-4 py-2 border">{req.m_certificate_id}</td>
                                    <td className="px-4 py-2 border">{req.resident_id}</td>
                                    <td className="px-4 py-2 border">{req.purpose}</td>
                                    <td className="px-4 py-2 border">{req.document_type}</td>
                                    <td className="px-4 py-2 border">{req.request_date}</td>
                                    <td className="px-4 py-2 border">{req.priority}</td>
                                    <td className="px-4 py-2 border">{req.status}</td>
                                    <td className="px-4 py-2 border">{req.payment_status}</td>
                                    <td className="px-4 py-2 border">
                                        <button
                                            className={`px-2 py-1 rounded text-white bg-blue-600 hover:bg-blue-700`}
                                            onClick={() => openModal(req)}
                                        // disabled={!hasMetaMask}
                                        // disabled={false}
                                        >
                                            Update
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Upload PDF for Request #{selectedRequest?.id}</h2>
                        <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-4" />
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                onClick={() => setModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={handleSubmit}
                                disabled={!file}
                            >
                                Submit
                            </button>
                        </div>
                        {message && <p className="mt-2 text-sm">{message}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestPage;
