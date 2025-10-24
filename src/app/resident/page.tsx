import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardStats } from "@/components/dashboard-stats";
import { RequestCertificateDialog } from "@/components/request-certificate-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RequestTrendsChart, CertificateTypesChart, DailyActivityChart } from "@/components/dashboard-charts";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  User, 
  ArrowRight, 
  Bell,
  TrendingUp,
  Activity,
  Star
} from "lucide-react";

export default async function ResidentPage() {
  const headersList = await headers();
  const userDataHeader = headersList.get('x-user-data');

  // Parse user data (guaranteed to exist due to middleware protection)
  const user = JSON.parse(userDataHeader!);

  return (
    <DashboardLayout user={user} title="Resident Dashboard">
      <div className="container mx-auto px-4 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <MapPin className="h-3 w-3 mr-1" />
                    {user.current_barangay}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Resident
                  </Badge>
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    Welcome back, {user.first_name}!
                  </h1>
                  <p className="text-blue-100 text-lg max-w-2xl">
                    Manage your certificate requests, track applications, and access barangay services all in one place.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                  <FileText className="h-4 w-4 mr-2" />
                  Request Certificate
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Bell className="h-4 w-4 mr-2" />
                  View Notifications
                </Button>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "New Request",
              description: "Submit a certificate request",
              icon: FileText,
              color: "bg-blue-500",
              href: "/resident/certificates"
            },
            {
              title: "Track Requests",
              description: "Monitor your applications",
              icon: Clock,
              color: "bg-orange-500",
              href: "/resident/requests"
            },
            {
              title: "Completed",
              description: "View finished requests",
              icon: CheckCircle,
              color: "bg-green-500",
              href: "/resident/requests?status=completed"
            },
            {
              title: "Help & Support",
              description: "Get assistance",
              icon: AlertCircle,
              color: "bg-purple-500",
              href: "/resident/support"
            }
          ].map((action, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-sm hover:shadow-xl hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest interactions and updates</CardDescription>
                </div>
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
                    action: "Certificate Request Submitted",
                    description: "Barangay Clearance request has been submitted",
                    time: "2 hours ago",
                    status: "pending",
                    icon: FileText
                  },
                  {
                    action: "Request Approved",
                    description: "Your Indigency Certificate is ready for pickup",
                    time: "1 day ago",
                    status: "completed",
                    icon: CheckCircle
                  },
                  {
                    action: "Document Uploaded",
                    description: "Valid ID uploaded for verification",
                    time: "3 days ago",
                    status: "in-progress",
                    icon: Clock
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-600' :
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                    <Badge variant={
                      activity.status === 'completed' ? 'default' :
                      activity.status === 'pending' ? 'secondary' : 'outline'
                    } className="capitalize">
                      {activity.status.replace('-', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Upcoming
              </CardTitle>
              <CardDescription>Important dates and deadlines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-purple-900">Document Pickup</span>
                </div>
                <p className="text-sm text-purple-700">Barangay Clearance ready</p>
                <p className="text-xs text-purple-600 mt-1">Due: Tomorrow, 2:00 PM</p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-900">Community Meeting</span>
                </div>
                <p className="text-sm text-blue-700">Monthly barangay assembly</p>
                <p className="text-xs text-blue-600 mt-1">Dec 15, 7:00 PM</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-900">Holiday Notice</span>
                </div>
                <p className="text-sm text-green-700">Office closed for Christmas</p>
                <p className="text-xs text-green-600 mt-1">Dec 25 - Jan 1</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Analytics & Insights Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
              <p className="text-gray-600">Visual overview of your certificate requests and community trends</p>
            </div>
            <Badge variant="outline" className="text-xs">
              Real-time data
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RequestTrendsChart />
            <CertificateTypesChart />
          </div>
          
          <DailyActivityChart />
        </div>

        {/* Dashboard Stats Component */}
        <DashboardStats 
          userRole="resident" 
          userId={user.id}
          userInfo={user}
        />
      </div>
    </DashboardLayout>
  );
}
