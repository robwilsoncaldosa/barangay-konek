import { headers } from "next/headers";
import { DashboardLayout } from "@/components/dashboard-layout";
import RequestTable from "@/components/request-table";
import CertificateTable from "@/components/certificate-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ResidentPage() {
  const headersList = await headers();
  const userDataHeader = headersList.get('x-user-data');

  // Parse user data (guaranteed to exist due to middleware protection)
  const user = JSON.parse(userDataHeader!);

  return (
    <DashboardLayout user={user} title="Resident Portal">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Welcome, {user.name}!</h1>
        
        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="certificates">My Certificates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="requests" className="space-y-4">
            <RequestTable 
              userRole="resident" 
              showActions={false} 
              userId={user.id}
            />
          </TabsContent>
          
          <TabsContent value="certificates" className="space-y-4">
            <CertificateTable 
              userRole="resident" 
              showActions={false} 
              userId={user.id}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
