import { headers } from "next/headers";
import { DashboardLayout } from "@/components/dashboard-layout";

export default async function ResidentPage() {
  const headersList = await headers();
  const userDataHeader = headersList.get('x-user-data');

  // Parse user data (guaranteed to exist due to middleware protection)
  const user = JSON.parse(userDataHeader!);

  return (
    <DashboardLayout user={user} title="Resident Portal">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Welcome Resident!</h1>
        <div className="space-y-8">
          <p className="text-muted-foreground">
            Resident portal content will be added here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
