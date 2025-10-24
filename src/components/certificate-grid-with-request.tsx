"use client";

import { useState } from "react";
import { CertificateGrid } from "./certificate-grid";
import { RequestCertificateDialog } from "./request-certificate-dialog";
import { Tables } from "../../database.types";

type Certificate = Tables<"mCertificate">;

interface CertificateGridWithRequestProps {
  userRole?: "admin" | "official" | "resident";
  userId?: number;
}

export function CertificateGridWithRequest({ 
  userRole = "resident", 
  userId 
}: CertificateGridWithRequestProps) {
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRequestCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedCertificate(null);
  };

  return (
    <>
      <CertificateGrid
        userRole={userRole}
        userId={userId}
        onRequestCertificate={handleRequestCertificate}
      />
      
      {userId && (
        <RequestCertificateDialog
          certificate={selectedCertificate}
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          userId={userId}
        />
      )}
    </>
  );
}