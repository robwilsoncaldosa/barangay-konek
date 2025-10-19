"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/server/user";
// import { getContract } from "@/lib/blockchain"; // used only for officials

declare global {
  interface Window {
    ethereum?: import("ethers").Eip1193Provider;
  }
}

interface RegisterProps {
  userType: "resident" | "official";
}

export default function Register({ userType }: RegisterProps) {
  const router = useRouter();

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
  const [showPassword, setShowPassword] = useState(false);
  const [sameAddress, setSameAddress] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, user_type: userType }));
  }, [userType]);

  // Copy permanent address to current when checkbox is checked
  useEffect(() => {
    if (sameAddress) {
      setFormData((prev) => ({
        ...prev,
        current_address: prev.permanent_address,
        current_barangay: prev.permanent_barangay,
      }));
    }
  }, [sameAddress, formData.permanent_address, formData.permanent_barangay]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Creating account...");

    try {
      // ✅ Step 1: Save user to backend using server action
      const result = await createUser({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        birthdate: formData.birthdate,
        permanent_address: formData.permanent_address,
        permanent_barangay: formData.permanent_barangay,
        current_address: formData.current_address,
        current_barangay: formData.current_barangay,
        contact_no: formData.contact_no,
        middle_name: formData.middle_name,
        mbarangayid: Number(formData.mBarangayId),
        user_type: formData.user_type as 'official' | 'resident',
      });

      if (result.success) {
        // ✅ Step 2: Officials are also registered on blockchain
        // if (userType === "official") {
        //   try {
        //     if (!window.ethereum) throw new Error("MetaMask not detected");

        //     const contract = await getContract();
        //     const fullName = `${formData.first_name} ${formData.last_name}`;

        //     const tx = await contract.register(fullName, formData.user_type);
        //     setMessage("⏳ Recording on blockchain...");
        //     await tx.wait();

        //     setMessage("✅ User successfully registered on blockchain!");
        //   } catch (err) {
        //     console.error("Blockchain error:", err);
        //     setMessage("⚠️ Account created, but blockchain registration failed.");
        //   }
        // }

        // ✅ Redirect after success
        setMessage("✅ Account created successfully!");
        router.push(`/register/success?userType=${userType}`);
      } else {
        setMessage(`❌ ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Unexpected error occurred");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-700">
          Register as {userType.charAt(0).toUpperCase() + userType.slice(1)}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name fields */}
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

          {/* Email */}
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full px-3 py-2 border rounded text-black"
          />

          {/* Password with eye toggle */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-3 py-2 border rounded text-black pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-gray-500"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Birthdate */}
          <input
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded text-black"
          />

          {/* Permanent address */}
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

          {/* Same address checkbox */}
          <label className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              checked={sameAddress}
              onChange={() => setSameAddress(!sameAddress)}
              className="mr-2"
            />
            Same as permanent address
          </label>

          {/* Current address */}
          {!sameAddress && (
            <>
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
            </>
          )}

          {/* Contact number */}
          <input
            type="text"
            name="contact_no"
            value={formData.contact_no}
            onChange={handleChange}
            placeholder="Contact No."
            required
            className="w-full px-3 py-2 border rounded text-black"
          />

          {/* Barangay ID (officials only) */}
          {userType === "official" && (
            <input
              type="text"
              name="mBarangayId"
              value={formData.mBarangayId}
              onChange={handleChange}
              placeholder="Barangay ID"
              required
              className="w-full px-3 py-2 border rounded text-black"
            />
          )}

          {/* Submit */}
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
}
