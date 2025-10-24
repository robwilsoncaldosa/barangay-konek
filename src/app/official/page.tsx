import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardStats } from "@/components/dashboard-stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RequestTrendsChart, CertificateTypesChart, ProcessingTimeChart, DailyActivityChart } from "@/components/dashboard-charts";
import { 
  Users, 
  FileText, 
  TrendingUp, 
  BarChart3,
  Calendar,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  MapPin,
  ArrowRight,
  Activity,
  PieChart
} from "lucide-react";

export default async function OfficialPage() {
  const headersList = await headers();
  const userDataHeader = headersList.get('x-user-data');

  // Parse user data (guaranteed to exist due to middleware protection)
  const user = JSON.parse(userDataHeader!);
  
  return (
    <DashboardLayout user={user} title="Official Dashboard">
      <div className="container mx-auto px-4 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <Shield className="h-3 w-3 mr-1" />
                    Official
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <MapPin className="h-3 w-3 mr-1" />
                    {user.current_barangay}
                  </Badge>
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    Welcome, {user.first_name} {user.last_name}!
                  </h1>
                  <p className="text-emerald-100 text-lg max-w-2xl">
                    Manage requests, oversee operations, and ensure efficient barangay services for all residents.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage System
                </Button>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Total Requests",
              value: "247",
              change: "+12%",
              trend: "up",
              icon: FileText,
              color: "text-blue-600",
              bgColor: "bg-blue-50",
              description: "This month"
            },
            {
              title: "Active Residents",
              value: "1,234",
              change: "+5%",
              trend: "up",
              icon: Users,
              color: "text-green-600",
              bgColor: "bg-green-50",
              description: "Registered users"
            },
            {
              title: "Pending Reviews",
              value: "23",
              change: "-8%",
              trend: "down",
              icon: Clock,
              color: "text-orange-600",
              bgColor: "bg-orange-50",
              description: "Awaiting action"
            },
            {
              title: "Completion Rate",
              value: "94%",
              change: "+3%",
              trend: "up",
              icon: CheckCircle,
              color: "text-emerald-600",
              bgColor: "bg-emerald-50",
              description: "Last 30 days"
            }
          ].map((metric, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                      <span className={`text-sm font-medium ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{metric.description}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${metric.bgColor} flex items-center justify-center`}>
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Management Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Request Management",
              description: "Process and review certificate requests",
              icon: FileText,
              color: "bg-blue-500",
              href: "/official/requests",
              stats: "23 pending"
            },
            {
              title: "Certificate System",
              description: "Manage available certificates and pricing",
              icon: Shield,
              color: "bg-purple-500",
              href: "/official/certificates",
              stats: "12 types available"
            },
            {
              title: "Resident Directory",
              description: "View and manage resident information",
              icon: Users,
              color: "bg-green-500",
              href: "/official/residents",
              stats: "1,234 residents"
            },
            {
              title: "Analytics & Reports",
              description: "View detailed statistics and generate reports",
              icon: BarChart3,
              color: "bg-orange-500",
              href: "/official/analytics",
              stats: "Real-time data"
            },
            {
              title: "System Settings",
              description: "Configure system parameters and preferences",
              icon: Settings,
              color: "bg-gray-500",
              href: "/official/settings",
              stats: "Admin access"
            },
            {
              title: "Notifications",
              description: "Manage alerts and communication",
              icon: Activity,
              color: "bg-red-500",
              href: "/official/notifications",
              stats: "5 new alerts"
            }
          ].map((tool, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-sm hover:shadow-xl hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200`}>
                      <tool.icon className="h-6 w-6" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">{tool.title}</h3>
                    <p className="text-sm text-gray-600">{tool.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      {tool.stats}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    Recent System Activity
                  </CardTitle>
                  <CardDescription>Latest administrative actions and updates</CardDescription>
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
                    action: "Request Approved",
                    description: "Barangay Clearance for Maria Santos",
                    time: "5 minutes ago",
                    type: "approval",
                    icon: CheckCircle
                  },
                  {
                    action: "New Registration",
                    description: "Juan Dela Cruz registered as resident",
                    time: "1 hour ago",
                    type: "registration",
                    icon: Users
                  },
                  {
                    action: "Certificate Updated",
                    description: "Indigency Certificate fee modified",
                    time: "2 hours ago",
                    type: "update",
                    icon: Settings
                  },
                  {
                    action: "System Alert",
                    description: "High volume of requests detected",
                    time: "3 hours ago",
                    type: "alert",
                    icon: AlertTriangle
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'approval' ? 'bg-green-100 text-green-600' :
                      activity.type === 'registration' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'update' ? 'bg-purple-100 text-purple-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-600" />
                System Overview
              </CardTitle>
              <CardDescription>Current system status and performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-green-900">System Status</p>
                      <p className="text-sm text-green-700">All services operational</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Request Processing</span>
                    <span className="text-sm text-gray-600">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Database Usage</span>
                    <span className="text-sm text-gray-600">62%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">User Activity</span>
                    <span className="text-sm text-gray-600">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">99.9%</p>
                    <p className="text-xs text-gray-600">Uptime</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">1.2s</p>
                    <p className="text-xs text-gray-600">Avg Response</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Analytics Dashboard */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
              <p className="text-gray-600">Comprehensive insights into barangay operations and performance metrics</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Live Data
              </Badge>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-3 w-3 mr-1" />
                Export Report
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RequestTrendsChart />
            <CertificateTypesChart />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProcessingTimeChart />
            <DailyActivityChart />
          </div>
        </div>
        
        {/* Dashboard Stats Component */}
        <DashboardStats 
          userRole="official" 
          userInfo={user}
        />
      </div>
    </DashboardLayout>
  );
}
