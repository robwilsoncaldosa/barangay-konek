import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";

export default async function OfficialPage() {
  const headersList = await headers();
  const userDataHeader = headersList.get('x-user-data');
  
  if (!userDataHeader) {
    redirect('/official/login');
  }

  let user;
  try {
    user = JSON.parse(userDataHeader);
  } catch (error) {
    console.error('Error parsing user data:', error);
    redirect('/official/login');
  }

  // Ensure user has official access
  if (user.user_type !== 'official') {
    redirect('/official/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        user={user}
        variant="default"
        position="sticky"
      />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome Official!</h1>
        <div className="space-y-8">
          <p className="text-muted-foreground">
            Official dashboard content will be added here.
          </p>
        </div>
      </main>
    </div>
  );
}
