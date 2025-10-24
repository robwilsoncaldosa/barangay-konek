import { headers } from "next/headers";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CertificateGridWithRequest } from "@/components/certificate-grid-with-request";

export default async function ResidentCertificatesPage() {
  const headersList = await headers();
  const userDataHeader = headersList.get('x-user-data');

  // Parse user data (guaranteed to exist due to middleware protection)
  const user = JSON.parse(userDataHeader!);

  return (
    <DashboardLayout user={user} title="Certificates">
      <div className="container mx-auto px-4">
        <CertificateGridWithRequest 
          userRole="resident" 
          userId={user.id}
        />
      </div>
    </DashboardLayout>
  );
}