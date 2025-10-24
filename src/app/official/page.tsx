import { headers } from "next/headers";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  ArrowRight,
  Activity
} from "lucide-react";

export default async function OfficialPage() {
  const headersList = await headers();
  const userDataHeader = headersList.get('x-user-data');

  // Parse user data (guaranteed to exist due to middleware protection)
  const user = JSON.parse(userDataHeader!);

  return (
    <DashboardLayout user={user} title="Official Dashboard">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Welcome, {user.first_name} {user.last_name}
              </h1>
              <p className="text-muted-foreground mt-1">
                {user.current_barangay} • Official Dashboard
              </p>
            </div>
            <Badge variant="secondary">
              <Activity className="h-3 w-3 mr-1" />
              Online
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Total Requests",
              value: "247",
              change: "+12%",
              icon: FileText,
              description: "This month"
            },
            {
              title: "Active Residents",
              value: "1,234",
              change: "+5%",
              icon: Users,
              description: "Registered users"
            },
            {
              title: "Pending Reviews",
              value: "23",
              change: "-8%",
              icon: Clock,
              description: "Awaiting action"
            },
            {
              title: "Completion Rate",
              value: "94%",
              change: "+3%",
              icon: CheckCircle,
              description: "Last 30 days"
            }
          ].map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                      <span className="text-sm font-medium text-muted-foreground">
                        {metric.change}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <metric.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Request Management",
              description: "Process and review certificate requests",
              icon: FileText,
              href: "/official/requests",
              stats: "23 pending"
            },
            {
              title: "Resident Directory",
              description: "View and manage resident information",
              icon: Users,
              href: "/official/residents",
              stats: "1,234 residents"
            },
            {
              title: "System Activity",
              description: "Monitor system status and activity",
              icon: Activity,
              href: "/official/activity",
              stats: "All systems operational"
            }
          ].map((action, index) => (
            <Card key={index} className="group hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                    <Badge variant="outline" className="text-xs">
                      {action.stats}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "Request Approved",
                  description: "Barangay Clearance for Maria Santos",
                  time: "5 minutes ago",
                  icon: CheckCircle
                },
                {
                  action: "New Registration",
                  description: "Juan Dela Cruz registered as resident",
                  time: "1 hour ago",
                  icon: Users
                },
                {
                  action: "Request Submitted",
                  description: "Indigency Certificate requested",
                  time: "2 hours ago",
                  icon: FileText
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center">
                    <activity.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
