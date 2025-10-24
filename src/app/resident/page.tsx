import { headers } from "next/headers";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardStats } from "@/components/dashboard-stats";

export default async function ResidentPage() {
  const headersList = await headers();
  const userDataHeader = headersList.get('x-user-data');

  // Parse user data (guaranteed to exist due to middleware protection)
  const user = JSON.parse(userDataHeader!);

  return (
    <DashboardLayout user={user} title="Resident Dashboard">
      <div className="container mx-auto px-4 space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Welcome, {user.first_name} {user.last_name}!</h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your requests and available services.
          </p>
        </div>
        
        <DashboardStats 
          userRole="resident" 
          userId={user.id}
          userInfo={user}
        />
      </div>
    </DashboardLayout>
  );
}
