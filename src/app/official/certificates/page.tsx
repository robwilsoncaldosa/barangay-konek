import { headers } from "next/headers";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CertificateGrid } from "@/components/certificate-grid";

export default async function OfficialCertificatesPage() {
  const headersList = await headers();
  const userDataHeader = headersList.get('x-user-data');

  // Parse user data (guaranteed to exist due to middleware protection)
  const user = JSON.parse(userDataHeader!);

  return (
    <DashboardLayout user={user} title="Certificate Management">
      <div className="container mx-auto px-4">
        <CertificateGrid 
          userRole="official"
        />
      </div>
    </DashboardLayout>
  );
}