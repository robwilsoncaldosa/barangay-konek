"use client";

import { useState } from "react";
import { createRequest } from "@/server/request";
import { useRouter } from "next/navigation";
import type { Database, Tables, TablesInsert } from "../../../../database.types";

type Certificate = Tables<"mCertificate">;
type RequestInsert = TablesInsert<"mRequest">;

// Define priority type based on common values
type Priority = "Normal" | "Urgent";

interface ResidentFormProps {
  certificates: Certificate[];
  userId: number;
}

export default function ResidentForm({ certificates, userId }: ResidentFormProps) {
  const router = useRouter();
  const [selectedCertificate, setSelectedCertificate] = useState<string>("");
  const [documentType, setDocumentType] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("Normal");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCertificate || !purpose || !documentType) {
      setMessage("Please select certificate, document type, and enter purpose.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const requestData: Pick<RequestInsert, 'mCertificateId' | 'resident_id' | 'purpose' | 'document_type' | 'request_date' | 'priority'> = {
        resident_id: userId,
        mCertificateId: Number(selectedCertificate),
        document_type: documentType,
        purpose,
        request_date: new Date().toISOString().split("T")[0],
        priority,
      };

      const result = await createRequest(requestData);

      if (result.success) {
        setMessage("Request submitted successfully!");
        setSelectedCertificate("");
        setDocumentType("");
        setPurpose("");
        setPriority("Normal");
        
        // Refresh the page to show updated requests
        router.refresh();
      } else {
        setMessage(result.error || "Failed to submit request");
      }
    } catch (error) {
      setMessage("An unexpected error occurred");
      console.error("Error submitting request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {message && (
        <p
          className={`mb-4 ${
            message.toLowerCase().includes("error") || message.toLowerCase().includes("failed")
              ? "text-red-500"
              : "text-green-500"
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
            disabled={isSubmitting}
          >
            <option value="">-- Select Certificate --</option>
            {certificates.map((cert) => (
              <option key={cert.id} value={cert.id}>
                {cert.name} (₱{cert.fee?.toFixed(2) || '0.00'})
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
        </label>
        <label>
          Priority:
          <select
            className="border p-2 w-full"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            disabled={isSubmitting}
          >
            <option value="Normal">Normal</option>
            <option value="Urgent">Urgent</option>
          </select>
        </label>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </>
  );
}