"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, FileText, Clock, MapPin, User, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { Tables } from "../../database.types"

interface DashboardStatsProps {
  userRole: "resident" | "official"
  userId?: number
  userInfo?: Tables<"mUsers">
}

interface RequestStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  rejected: number
}

interface CertificateStats {
  totalCertificates: number
  averageFee: number
  mostRequested: string
}

export function DashboardStats({ userRole, userId, userInfo }: DashboardStatsProps) {
  const [requestStats, setRequestStats] = useState<RequestStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0
  })
  const [certificateStats, setCertificateStats] = useState<CertificateStats>({
    totalCertificates: 0,
    averageFee: 0,
    mostRequested: "N/A"
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [userRole, userId])

  const fetchStats = async () => {
    
    try {
      // Fetch request statistics
      let requestQuery = supabase
        .from("mRequest")
        .select("status, mCertificateId")
        .eq("del_flag", 0)

      if (userRole === "resident" && userId) {
        requestQuery = requestQuery.eq("resident_id", userId)
      }

      const { data: requests } = await requestQuery

      if (requests) {
        const stats = requests.reduce((acc: RequestStats, request: { status?: string | null; mCertificateId?: number | null }) => {
          acc.total++
          switch (request.status?.toLowerCase()) {
            case "pending":
              acc.pending++
              break
            case "in-progress":
              acc.inProgress++
              break
            case "completed":
              acc.completed++
              break
            case "rejected":
              acc.rejected++
              break
          }
          return acc
        }, { total: 0, pending: 0, inProgress: 0, completed: 0, rejected: 0 })

        setRequestStats(stats)
      }

      // Fetch certificate statistics
      const { data: certificates } = await supabase
        .from("mCertificate")
        .select("id, name, fee")
        .eq("del_flag", 0)

      if (certificates) {
        const totalCertificates = certificates.length
        const averageFee = certificates.reduce((sum: number, cert: { fee?: number | null }) => sum + (cert.fee || 0), 0) / totalCertificates
        
        // Find most requested certificate
        const certificateRequests = requests?.reduce((acc: Record<number, number>, request: { mCertificateId?: number | null }) => {
          if (request.mCertificateId) {
            acc[request.mCertificateId] = (acc[request.mCertificateId] || 0) + 1
          }
          return acc
        }, {})

        let mostRequested = "N/A"
        if (certificateRequests) {
          const mostRequestedId = Object.entries(certificateRequests)
            .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0]
          
          if (mostRequestedId) {
            const cert = certificates.find((c: { id: number; name?: string }) => c.id === parseInt(mostRequestedId))
            mostRequested = cert?.name || "N/A"
          }
        }

        setCertificateStats({
          totalCertificates,
          averageFee,
          mostRequested
        })
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "in-progress": return "bg-blue-100 text-blue-800"
      case "completed": return "bg-green-100 text-green-800"
      case "rejected": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Information Card */}
      {userInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="text-lg font-semibold">
                  {userInfo.first_name} {userInfo.middle_name} {userInfo.last_name}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-lg">{userInfo.email}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Contact</p>
                <p className="text-lg">{userInfo.contact_no}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Current Barangay
                </p>
                <p className="text-lg font-semibold text-blue-600">{userInfo.current_barangay}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Permanent Barangay</p>
                <p className="text-lg">{userInfo.permanent_barangay}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">User Type</p>
                <Badge variant="outline" className="capitalize">
                  {userInfo.user_type}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requestStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {userRole === "resident" ? "Your requests" : "All requests"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{requestStats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{requestStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Currently processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CalendarDays className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{requestStats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Request Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Request Status Overview</CardTitle>
          <CardDescription>
            {userRole === "resident" 
              ? "Your request status breakdown" 
              : "Overall request status distribution"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "Pending", count: requestStats.pending, status: "pending" },
              { label: "In Progress", count: requestStats.inProgress, status: "in-progress" },
              { label: "Completed", count: requestStats.completed, status: "completed" },
              { label: "Rejected", count: requestStats.rejected, status: "rejected" }
            ].map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(item.status)}>
                    {item.label}
                  </Badge>
                  <span className="text-sm text-gray-600">{item.count} requests</span>
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        item.status === "pending" ? "bg-yellow-500" :
                        item.status === "in-progress" ? "bg-blue-500" :
                        item.status === "completed" ? "bg-green-500" : "bg-red-500"
                      }`}
                      style={{ 
                        width: requestStats.total > 0 ? `${(item.count / requestStats.total) * 100}%` : "0%" 
                      }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium">
                  {requestStats.total > 0 ? Math.round((item.count / requestStats.total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certificate Information */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Certificate Statistics</CardTitle>
            <CardDescription>Available certificates and pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Certificates</span>
              <span className="text-2xl font-bold">{certificateStats.totalCertificates}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Fee</span>
              <span className="text-2xl font-bold">₱{certificateStats.averageFee.toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Most Requested</span>
              <span className="text-sm font-semibold text-blue-600">{certificateStats.mostRequested}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {userRole === "resident" ? (
              <>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Need a certificate?</p>
                  <p className="text-xs text-blue-700">Browse available certificates and submit a request</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900">Track your requests</p>
                  <p className="text-xs text-green-700">Monitor the status of your submitted requests</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-900">Manage Requests</p>
                  <p className="text-xs text-purple-700">Process and update request statuses</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm font-medium text-orange-900">Certificate Management</p>
                  <p className="text-xs text-orange-700">Add, edit, or remove available certificates</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}