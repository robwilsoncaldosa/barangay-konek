"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const OfficialLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user && JSON.parse(user).user_type === "official") {
      router.push("/official");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Logging in...");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        email: email,
        password: password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.message === "User not found") {
        setMessage("Official not found. You can create an account or reset password.");
      } else {
        setMessage(`❌ ${data.message}`);
      }
      return;
    }

    localStorage.setItem("user", JSON.stringify(data.user));
    router.push("/official");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-700">
          Official Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
            className="w-full px-3 py-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Log In
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          <a href="/official/forgot-password" className="text-blue-600 hover:underline">
            Forgot Password?
          </a>
          <a href="/register/official?userType=official" className="text-blue-600 hover:underline">
            Create Account
          </a>
        </div>

        {message && <p className="mt-2 text-center text-gray-600">{message}</p>}
      </div>
    </div>
  );
};

export default OfficialLogin;
