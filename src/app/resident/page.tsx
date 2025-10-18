"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

type Certificate = {
  id: number;
  name: string;
  fee: number;
};

type Request = {
  id: number;
  mCertificateId: number;
  document_type: string;
  purpose: string;
  request_date: string;
  priority: string;
  status: string;
  payment_status: string;
};

export default function ResidentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/resident");
      return;
    }
    const userType = JSON.parse(userStr).user_type;
    if (userType !== "resident") {
      router.push("/login");
      return;
    }
    setLoading(false);
    fetchCertificates();
    fetchRequests();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await fetch("/api/certificates");
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setCertificates(json.data);
    } catch (err) {
      console.error("Error fetching certificates:", err);
    }
  };

  const fetchRequests = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const res = await fetch(`/api/requests?resident_id=${user.id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setRequests(json.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!selectedCertificate || !purpose || !documentType) {
      setMessage("Please select certificate, document type, and enter purpose.");
      return;
    }

    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    const user = JSON.parse(userStr);

    const requestData = {
      resident_id: user.id,
      mCertificateId: selectedCertificate,
      document_type: documentType,
      purpose,
      request_date: new Date().toISOString().split("T")[0],
      priority,
    };

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setMessage("Request submitted successfully!");
      setSelectedCertificate("");
      setDocumentType("");
      setPurpose("");
      setPriority("Normal");

      // Refresh requests table
      fetchRequests();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unexpected error");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="max-w-md mx-auto mt-8 p-4 border rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Request a Certificate</h1>
        {message && (
          <p
            className={`mb-4 ${message.toLowerCase().includes('error') ? 'text-red-500' : 'text-blue-500'
              }`}
          >
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label>
            Certificate:
            <select
              className="border p-2 w-full"
              value={selectedCertificate}
              onChange={(e) => setSelectedCertificate(e.target.value)}
            >
              <option value="">-- Select Certificate --</option>
              {certificates.map((cert) => (
                <option key={cert.id} value={cert.id}>
                  {cert.name} (₱{cert.fee.toFixed(2)})
                </option>
              ))}
            </select>
          </label>
          <label>
            Document Type:
            <input
              type="text"
              className="border p-2 w-full"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              placeholder="e.g., Barangay Clearance"
            />
          </label>
          <label>
            Purpose:
            <input
              type="text"
              className="border p-2 w-full"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Reason for requesting"
            />
          </label>
          <label>
            Priority:
            <select
              className="border p-2 w-full"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
            </select>
          </label>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Submit Request
          </button>
        </form>
      </div>

      {/* Display requests table */}
      <div className="max-w-3xl mx-auto mt-8 p-4 border rounded shadow">
        <h2 className="text-xl font-bold mb-4">My Requests</h2>
        {requests.length === 0 ? (
          <p>No requests submitted yet.</p>
        ) : (
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Certificate ID</th>
                <th className="border p-2">Document Type</th>
                <th className="border p-2">Purpose</th>
                <th className="border p-2">Request Date</th>
                <th className="border p-2">Priority</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Payment</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td className="border p-2">{r.mCertificateId}</td>
                  <td className="border p-2">{r.document_type}</td>
                  <td className="border p-2">{r.purpose}</td>
                  <td className="border p-2">{r.request_date}</td>
                  <td className="border p-2">{r.priority}</td>
                  <td className="border p-2">{r.status}</td>
                  <td className="border p-2">{r.payment_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
