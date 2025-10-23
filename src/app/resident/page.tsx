import { getCertificates } from "@/server/certificate";
import { getRequests } from "@/server/request";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import ResidentForm from "./_components/resident-form";
import RequestsTable from "./_components/requests-table";

async function getUserFromHeaders() {
  const headersList = await headers();
  const userDataHeader = headersList.get('x-user-data');

  if (!userDataHeader) {
    redirect('/login');
  }

  try {
    return JSON.parse(userDataHeader);
  } catch (error) {
    console.error('Error parsing user data from headers:', error);
    redirect('/login');
  }
}

export default async function ResidentPage() {
  const user = await getUserFromHeaders();

  // Fetch data server-side
  const certificates = await getCertificates();
  const requests = await getRequests({ resident_id: user.id.toString() });

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        user={user}
        variant="default"
        position="sticky"
      />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Request Form */}
          <div className="border rounded-lg shadow-sm p-6 bg-card">
            <h1 className="text-2xl font-bold mb-4">Request a Certificate</h1>
            <ResidentForm
              certificates={certificates}
              userId={user.id}
            />
          </div>

          {/* Requests Table */}
          <div className="border rounded-lg shadow-sm p-6 bg-card">
            <h2 className="text-2xl font-bold mb-4">My Requests</h2>
            <RequestsTable requests={requests} />
          </div>
        </div>
      </main>
    </div>
  );
}
