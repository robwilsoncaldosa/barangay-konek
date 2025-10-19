"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserType = "super_admin" | "official" | "resident" | null;

const Navbar = () => {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>(null);

  // Load user info from localStorage
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setUserType(JSON.parse(user).user_type);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    // Redirect to the appropriate login page based on role
    if (userType === "super_admin") router.push("/admin/login");
    else if (userType === "official") router.push("/official/login");
    else router.push("/login"); // resident or default
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
      <div
        className="font-bold text-lg cursor-pointer"
        onClick={() => {
          if (userType === "super_admin") router.push("/admin");
          else if (userType === "official") router.push("/official");
          else if (userType === "resident") router.push("/resident");
          else router.push("/"); // guest
        }}
      >
        TEST
      </div>

      <ul className="flex space-x-4">
        {/* Guest links */}
        {!userType && (
          <>
            <li>
              <button onClick={() => router.push("/login")}>Resident Login</button>
            </li>
            <li>
              <button onClick={() => router.push("/official/login")}>Official Login</button>
            </li>
            <li>
              <button onClick={() => router.push("/admin/login")}>Admin Login</button>
            </li>
            <li>
              <button onClick={() => router.push("/register")}>Sign Up</button>
            </li>
          </>
        )}

        {/* Super Admin */}
        {userType === "super_admin" && (
          <>
            <li>
              <button onClick={() => router.push("/admin")}>Dashboard</button>
            </li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        )}

        {/* Official */}
        {userType === "official" && (
          <>
            <li>
              <button onClick={() => router.push("/official")}>Dashboard</button>
            </li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        )}

        {/* Resident */}
        {userType === "resident" && (
          <>
            <li>
              <button onClick={() => router.push("/resident")}>Dashboard</button>
            </li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
