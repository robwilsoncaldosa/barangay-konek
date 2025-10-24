import { headers } from "next/headers";
import { DashboardLayout } from "@/components/dashboard-layout";
import RequestListPage from "../../_components/request";

export default async function OfficialRequestsPage() {
  const headersList = await headers();
  const userDataHeader = headersList.get('x-user-data');

  // Parse user data (guaranteed to exist due to middleware protection)
  const user = JSON.parse(userDataHeader!);

  return (
    <DashboardLayout user={user} title="Document Requests">
      <div className="container mx-auto px-4">
        <RequestListPage 
        />
      </div>
    </DashboardLayout>
  );
}