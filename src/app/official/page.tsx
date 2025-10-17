"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserTable from "../../app/components/UserTable";
import Navbar from "../components/Navbar";
import CertificatePage from "../official/certificate/page";
import Request from "../../app/components/Request";


export default function OfficialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/official/login"); // not logged in → redirect to login
      return;
    }
    const userType = JSON.parse(user).user_type;
    if (userType !== "official") {
      router.push("/official/login"); // wrong role → redirect to login
      return;
    }
    setLoading(false);
  }, []);

  if (loading) return <p>Loading...</p>;

  return (<><h1>Welcome Official!</h1>      <Navbar />
    <UserTable userType="resident" />
    <CertificatePage />
    <Request />
    </>);
}
