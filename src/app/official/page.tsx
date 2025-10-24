import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardStats } from "@/components/dashboard-stats";

export default async function OfficialPage() {
  const headersList = await headers();
  const userDataHeader = headersList.get('x-user-data');

  // Parse user data (guaranteed to exist due to middleware protection)
  const user = JSON.parse(userDataHeader!);
  return (
    <DashboardLayout user={user} title="Official Dashboard">
      <div className="container mx-auto px-4 space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Welcome, {user.first_name} {user.last_name}!</h1>
          <p className="text-muted-foreground">
            Manage requests, certificates, and oversee barangay operations.
          </p>
        </div>
        
        <DashboardStats 
          userRole="official" 
          userInfo={user}
        />
      </div>
    </DashboardLayout>
  );
}
