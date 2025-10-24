"use client"

import * as React from "react"
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Line, 
  LineChart, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis,
  Cell
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { TrendingUp, TrendingDown, Calendar, Users, FileText, Clock } from "lucide-react"

// Sample data for request trends
const requestTrendsData = [
  { month: "Jan", requests: 45, completed: 42, pending: 3 },
  { month: "Feb", requests: 52, completed: 48, pending: 4 },
  { month: "Mar", requests: 38, completed: 35, pending: 3 },
  { month: "Apr", requests: 61, completed: 58, pending: 3 },
  { month: "May", requests: 73, completed: 68, pending: 5 },
  { month: "Jun", requests: 67, completed: 63, pending: 4 },
]

// Sample data for certificate types
const certificateTypesData = [
  { name: "Barangay Clearance", value: 145, fill: "var(--color-clearance)" },
  { name: "Indigency Certificate", value: 89, fill: "var(--color-indigency)" },
  { name: "Residency Certificate", value: 67, fill: "var(--color-residency)" },
  { name: "Business Permit", value: 34, fill: "var(--color-business)" },
  { name: "Others", value: 23, fill: "var(--color-others)" },
]

// Sample data for processing times
const processingTimeData = [
  { certificate: "Clearance", avgTime: 2.3, target: 3 },
  { certificate: "Indigency", avgTime: 1.8, target: 2 },
  { certificate: "Residency", avgTime: 2.1, target: 3 },
  { certificate: "Business", avgTime: 4.2, target: 5 },
  { certificate: "Others", avgTime: 3.1, target: 4 },
]

// Sample data for daily activity
const dailyActivityData = [
  { day: "Mon", requests: 12, approvals: 8 },
  { day: "Tue", requests: 15, approvals: 12 },
  { day: "Wed", requests: 8, approvals: 6 },
  { day: "Thu", requests: 18, approvals: 15 },
  { day: "Fri", requests: 22, approvals: 18 },
  { day: "Sat", requests: 5, approvals: 4 },
  { day: "Sun", requests: 3, approvals: 2 },
]

const requestTrendsConfig = {
  requests: {
    label: "Total Requests",
    color: "hsl(var(--chart-1))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-2))",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

const certificateTypesConfig = {
  clearance: {
    label: "Barangay Clearance",
    color: "hsl(var(--chart-1))",
  },
  indigency: {
    label: "Indigency Certificate",
    color: "hsl(var(--chart-2))",
  },
  residency: {
    label: "Residency Certificate",
    color: "hsl(var(--chart-3))",
  },
  business: {
    label: "Business Permit",
    color: "hsl(var(--chart-4))",
  },
  others: {
    label: "Others",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

const processingTimeConfig = {
  avgTime: {
    label: "Average Time (days)",
    color: "hsl(var(--chart-1))",
  },
  target: {
    label: "Target Time (days)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const dailyActivityConfig = {
  requests: {
    label: "New Requests",
    color: "hsl(var(--chart-1))",
  },
  approvals: {
    label: "Approvals",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface RequestTrendsChartProps {
  className?: string
}

export function RequestTrendsChart({ className }: RequestTrendsChartProps) {
  const totalRequests = React.useMemo(
    () => requestTrendsData.reduce((acc, curr) => acc + curr.requests, 0),
    []
  )

  const completionRate = React.useMemo(() => {
    const totalCompleted = requestTrendsData.reduce((acc, curr) => acc + curr.completed, 0)
    return Math.round((totalCompleted / totalRequests) * 100)
  }, [totalRequests])

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Request Trends
            </CardTitle>
            <CardDescription>Monthly request volume and completion rates</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{totalRequests}</div>
            <div className="text-sm text-gray-600">Total Requests</div>
            <Badge variant="secondary" className="mt-1">
              {completionRate}% completed
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={requestTrendsConfig}>
          <AreaChart
            accessibilityLayer
            data={requestTrendsData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillRequests" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-requests)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-requests)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-completed)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-completed)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="completed"
              type="natural"
              fill="url(#fillCompleted)"
              fillOpacity={0.4}
              stroke="var(--color-completed)"
              stackId="a"
            />
            <Area
              dataKey="requests"
              type="natural"
              fill="url(#fillRequests)"
              fillOpacity={0.4}
              stroke="var(--color-requests)"
              stackId="b"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

interface CertificateTypesChartProps {
  className?: string
}

export function CertificateTypesChart({ className }: CertificateTypesChartProps) {
  const totalCertificates = React.useMemo(
    () => certificateTypesData.reduce((acc, curr) => acc + curr.value, 0),
    []
  )

  const mostRequested = React.useMemo(
    () => certificateTypesData.reduce((prev, current) => 
      prev.value > current.value ? prev : current
    ),
    []
  )

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Certificate Distribution
            </CardTitle>
            <CardDescription>Breakdown by certificate type</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{totalCertificates}</div>
            <div className="text-sm text-gray-600">Total Issued</div>
            <Badge variant="secondary" className="mt-1">
              {mostRequested.name} leads
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={certificateTypesConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={certificateTypesData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              {certificateTypesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {certificateTypesData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-gray-600">{item.name}</span>
              <span className="font-medium ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface ProcessingTimeChartProps {
  className?: string
}

export function ProcessingTimeChart({ className }: ProcessingTimeChartProps) {
  const avgProcessingTime = React.useMemo(
    () => {
      const total = processingTimeData.reduce((acc, curr) => acc + curr.avgTime, 0)
      return (total / processingTimeData.length).toFixed(1)
    },
    []
  )

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Processing Times
            </CardTitle>
            <CardDescription>Average vs target processing times</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{avgProcessingTime}</div>
            <div className="text-sm text-gray-600">Avg Days</div>
            <Badge variant="secondary" className="mt-1">
              Within targets
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={processingTimeConfig}>
          <BarChart
            accessibilityLayer
            data={processingTimeData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="certificate"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="avgTime" fill="var(--color-avgTime)" radius={4} />
            <Bar dataKey="target" fill="var(--color-target)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

interface DailyActivityChartProps {
  className?: string
}

export function DailyActivityChart({ className }: DailyActivityChartProps) {
  const weeklyTotal = React.useMemo(
    () => dailyActivityData.reduce((acc, curr) => acc + curr.requests, 0),
    []
  )

  const approvalRate = React.useMemo(() => {
    const totalApprovals = dailyActivityData.reduce((acc, curr) => acc + curr.approvals, 0)
    return Math.round((totalApprovals / weeklyTotal) * 100)
  }, [weeklyTotal])

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Daily Activity
            </CardTitle>
            <CardDescription>This week&apos;s request and approval activity</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{weeklyTotal}</div>
            <div className="text-sm text-gray-600">This Week</div>
            <Badge variant="secondary" className="mt-1">
              {approvalRate}% approved
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={dailyActivityConfig}>
          <LineChart
            accessibilityLayer
            data={dailyActivityData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="requests"
              type="monotone"
              stroke="var(--color-requests)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-requests)",
              }}
              activeDot={{
                r: 6,
              }}
            />
            <Line
              dataKey="approvals"
              type="monotone"
              stroke="var(--color-approvals)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-approvals)",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}