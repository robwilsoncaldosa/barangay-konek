import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import RequestTable from "@/components/request-table";
import CertificateTable from "@/components/certificate-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function OfficialPage() {
  const headersList = await headers();
  const userDataHeader = headersList.get('x-user-data');

  // Parse user data (guaranteed to exist due to middleware protection)
  const user = JSON.parse(userDataHeader!);
  return (
    <DashboardLayout user={user} title="Official Panel">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Welcome, {user.first_name} {user.last_name}!</h1>
        
        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="requests">Document Requests</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="requests" className="space-y-4">
            <RequestTable 
              userRole="official" 
              showActions={true}
            />
          </TabsContent>
          
          <TabsContent value="certificates" className="space-y-4">
            <CertificateTable 
              userRole="official" 
              showActions={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
