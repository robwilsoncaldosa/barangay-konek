import { headers } from "next/headers";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardStats } from "@/components/dashboard-stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Users, 
  Activity, 
  MapPin, 
  ArrowRight
} from "lucide-react";

export default async function OfficialPage() {
  const headersList = await headers();
  const userDataHeader = headersList.get('x-user-data');

  // Parse user data (guaranteed to exist due to middleware protection)
  const user = JSON.parse(userDataHeader!);

  return (
    <DashboardLayout user={user} title="Official Dashboard">
      <div className="container mx-auto px-4 space-y-8">
        {/* Simplified Hero Section */}
        <div className="rounded-xl bg-primary p-6 text-primary-foreground">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                  <MapPin className="h-3 w-3 mr-1" />
                  {user.current_barangay}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold mb-1">Welcome, {user.first_name}!</h1>
              <p className="text-primary-foreground/80">Manage requests and oversee barangay operations.</p>
            </div>
            <Button size="lg" variant="secondary">
              <Activity className="h-4 w-4 mr-2" />
              View Activity
            </Button>
          </div>
        </div>

        {/* Essential Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Manage Requests",
              description: "Process certificate requests",
              icon: FileText,
              variant: "default" as const
            },
            {
              title: "View Residents",
              description: "Manage resident directory",
              icon: Users,
              variant: "secondary" as const
            },
            {
              title: "System Activity",
              description: "Monitor system status",
              icon: Activity,
              variant: "outline" as const
            }
          ].map((action, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-border hover:border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dashboard Stats Component */}
        <DashboardStats 
          userRole="official" 
          userId={user.id}
          userInfo={user}
        />
      </div>
    </DashboardLayout>
  );
}
