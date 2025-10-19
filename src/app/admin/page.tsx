"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../_components/navbar"; // matches the file exactly
import Officials from "../_components/officials";
import Residents from "../_components/residents";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/admin/login"); // not logged in → redirect to login
      return;
    }
    const userType = JSON.parse(user).user_type;
    if (userType !== "super_admin") {
      router.push("/admin/login"); // wrong role → redirect to login
      return;
    }
    setLoading(false);
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <h1>Welcome Super Admin!</h1>
      <Navbar />
      <Officials />
      <Residents />
    </>
  );
}
