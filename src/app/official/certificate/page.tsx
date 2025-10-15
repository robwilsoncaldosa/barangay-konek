"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import Navbar from "../components/Navbar";

interface Certificate {
  id: number;
  name: string;
  fee: number;
  processing_time: string;
  requirements: string;
}

export default function CertificatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/official/login");
      return;
    }
    const userType = JSON.parse(user).user_type;
    if (userType !== "official") {
      router.push("/official/login");
      return;
    }

    // Fetch certificates from backend
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await fetch("/api/certificates"); // create this API route
      if (!res.ok) throw new Error("Failed to fetch certificates");
      const data: Certificate[] = await res.json();
      setCertificates(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      {/* <Navbar /> */}
      <h1 className="text-2xl font-bold my-4">Certificates</h1>
      {/* <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Fee</th>
            <th className="border px-4 py-2">Processing Time</th>
            <th className="border px-4 py-2">Requirements</th>
          </tr>
        </thead>
        <tbody>
          {certificates.map((cert) => (
            <tr key={cert.id}>
              <td className="border px-4 py-2">{cert.id}</td>
              <td className="border px-4 py-2">{cert.name}</td>
              <td className="border px-4 py-2">{cert.fee.toFixed(2)}</td>
              <td className="border px-4 py-2">{cert.processing_time}</td>
              <td className="border px-4 py-2">{cert.requirements}</td>
            </tr>
          ))}
        </tbody>
      </table> */}
    </>
  );
}
