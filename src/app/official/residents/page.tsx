import { headers } from "next/headers";
import { DashboardLayout } from "@/components/dashboard-layout";
import UserTable from "@/app/admin/_components/user-table";

export default async function OfficialResidentsPage() {
  const headersList = await headers();
  const userDataHeader = headersList.get('x-user-data');

  // Parse user data (guaranteed to exist due to middleware protection)
  const user = JSON.parse(userDataHeader!);

  return (
    <DashboardLayout user={user} title="Residents Management">
      <div className="container mx-auto px-4 space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Residents Management</h1>
          <p className="text-muted-foreground">
            Manage residents and their information in your barangay.
          </p>
        </div>
        
        <UserTable userType="resident" />
      </div>
    </DashboardLayout>
  );
}