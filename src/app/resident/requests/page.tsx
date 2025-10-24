import { headers } from "next/headers";
import { DashboardLayout } from "@/components/dashboard-layout";
import RequestTable from "@/components/request-table";

export default async function ResidentRequestsPage() {
  const headersList = await headers();
  const userDataHeader = headersList.get('x-user-data');

  // Parse user data (guaranteed to exist due to middleware protection)
  const user = JSON.parse(userDataHeader!);

  return (
    <DashboardLayout user={user} title="My Requests">
      <div className="container mx-auto px-4">
        <RequestTable 
          userRole="resident" 
          showActions={false} 
          userId={user.id}
        />
      </div>
    </DashboardLayout>
  );
}