"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const RegisterPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultUserType = searchParams.get("userType") || "resident"; // default
  const [userType, setUserType] = useState(defaultUserType);
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    password: "",
    birthdate: "",
    permanent_address: "",
    permanent_barangay: "",
    current_address: "",
    current_barangay: "",
    contact_no: "",
    mBarangayId: "",
    user_type: userType,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    setFormData(prev => ({ ...prev, user_type: userType }));
  }, [userType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Creating account...");

    try {
      const res = await fetch("/api/mUsers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("✅ Account created successfully!");
        // redirect to success page
        router.push(`/register/success?userType=${userType}`);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      setMessage("❌ Unexpected error occurred");
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-700">
          Register as {userType.charAt(0).toUpperCase() + userType.slice(1)}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="First Name"
            required
            className="w-full px-3 py-2 border rounded text-black"
          />
          <input
            type="text"
            name="middle_name"
            value={formData.middle_name}
            onChange={handleChange}
            placeholder="Middle Name"
            className="w-full px-3 py-2 border rounded text-black"
          />
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Last Name"
            required
            className="w-full px-3 py-2 border rounded text-black"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full px-3 py-2 border rounded text-black"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-3 py-2 border rounded text-black"
          />
          <input
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded text-black"
          />
          <input
            type="text"
            name="permanent_address"
            value={formData.permanent_address}
            onChange={handleChange}
            placeholder="Permanent Address"
            required
            className="w-full px-3 py-2 border rounded text-black"
          />
          <input
            type="text"
            name="permanent_barangay"
            value={formData.permanent_barangay}
            onChange={handleChange}
            placeholder="Permanent Barangay"
            className="w-full px-3 py-2 border rounded text-black"
          />
          <input
            type="text"
            name="current_address"
            value={formData.current_address}
            onChange={handleChange}
            placeholder="Current Address"
            className="w-full px-3 py-2 border rounded text-black"
          />
          <input
            type="text"
            name="current_barangay"
            value={formData.current_barangay}
            onChange={handleChange}
            placeholder="Current Barangay"
            className="w-full px-3 py-2 border rounded text-black"
          />
          <input
            type="text"
            name="contact_no"
            value={formData.contact_no}
            onChange={handleChange}
            placeholder="Contact No."
            required
            className="w-full px-3 py-2 border rounded text-black"
          />
          <input
            type="text"
            name="mBarangayId"
            value={formData.mBarangayId}
            onChange={handleChange}
            placeholder="Barangay ID (optional)"
            className="w-full px-3 py-2 border rounded text-black"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-2"
          >
            Create Account
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
