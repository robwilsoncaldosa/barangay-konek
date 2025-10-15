"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userType = JSON.parse(user).user_type;
      // Redirect logged-in users to their dashboard
      if (userType === "super_admin") router.push("/admin");
      else if (userType === "official") router.push("/official");
      else if (userType === "resident") router.push("/resident");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1>Welcome to Barangay Konek</h1>
      <p>Please <a href="/login" className="text-blue-600">login</a> to continue.</p>
    </div>
  );
}
