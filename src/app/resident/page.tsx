import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";

export default async function ResidentPage() {
  const headersList = await headers();
  const userDataHeader = headersList.get('x-user-data');

  if (!userDataHeader) {
    redirect('/resident/login');
  }

  let user;
  try {
    user = JSON.parse(userDataHeader);
  } catch (error) {
    console.error('Error parsing user data:', error);
    redirect('/resident/login');
  }

  // Ensure user has resident access
  if (user.user_type !== 'resident') {
    redirect('/resident/login');
  }

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
