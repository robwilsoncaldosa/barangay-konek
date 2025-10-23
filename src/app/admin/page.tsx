import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import Officials from "./_components/officials";
import Residents from "./_components/residents";

export default async function AdminPage() {
  const headersList = await headers();
  const userDataHeader = headersList.get('x-user-data');

  if (!userDataHeader) {
    redirect('/admin/login');
  }

  let user;
  try {
    user = JSON.parse(userDataHeader);
  } catch (error) {
    console.error('Error parsing user data:', error);
    redirect('/admin/login');
  }

  // Ensure user has admin access
  if (user.user_type !== 'super_admin') {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        user={user}
        variant="default"
        position="sticky"
      />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome Super Admin!</h1>
        <div className="space-y-8">
          <Officials />
          <Residents />
        </div>
      </main>
    </div>
  );
}
