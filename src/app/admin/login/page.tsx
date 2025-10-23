"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/server/auth"; // import from your server-side file

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user && JSON.parse(user).user_type === "super_admin") {
      router.push("/admin");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("🔐 Logging in...");

    try {
      const res = await loginUser(email, password);

      console.log('Test', res);

      if (!res.success) {
        setMessage("Something went wrong!");
        setLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(res.user));
      setMessage("✅ Login successful! Redirecting...");
      router.push("/admin");
    } catch (err) {
      console.error(err);
      setMessage("❌ Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-200">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-blue-100">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
          Super Admin Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-medium transition ${loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${message.startsWith("❌")
              ? "text-red-600"
              : message.startsWith("✅")
                ? "text-green-600"
                : "text-gray-700"
              }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
