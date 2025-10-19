import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getUser } from '@/server/user'

export default async function HomePage() {
  const user = await getUser()

  // Redirect authenticated users to their respective dashboards
  if (user) {
    const userType = user.user_metadata?.user_type

    switch (userType) {
      case 'official':
        redirect('/official')
      case 'resident':
        redirect('/resident')
      default:
        redirect('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src="/logo.svg"
              alt="Barangay Konek Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="text-xl font-bold text-foreground">
              Barangay Konek
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-5xl font-bold text-foreground md:text-6xl">
            Digital Barangay Management System
          </h1>
          <p className="mb-8 text-xl text-muted-foreground md:text-2xl">
            Streamline your barangay operations with our comprehensive digital platform.
            Manage residents, handle requests, and improve community services efficiently.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/register" className="px-8 py-3">
                Start Free Trial
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login" className="px-8 py-3">
                Login to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Key Features
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to manage your barangay effectively
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Resident Management</CardTitle>
              <CardDescription>
                Maintain comprehensive resident records and profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Keep track of all residents with detailed profiles, contact information,
                and household data for better community management.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Processing</CardTitle>
              <CardDescription>
                Streamline certificate and clearance requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Handle barangay clearances, certificates, and other document requests
                digitally with automated workflows and tracking.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Complaint Management</CardTitle>
              <CardDescription>
                Track and resolve community issues efficiently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Receive, categorize, and manage resident complaints with proper
                documentation and resolution tracking.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Management</CardTitle>
              <CardDescription>
                Organize and promote community events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Plan, schedule, and manage barangay events with RSVP tracking
                and community notifications.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Tracking</CardTitle>
              <CardDescription>
                Monitor barangay finances and budgets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Keep track of barangay funds, expenses, and budget allocations
                with transparent financial reporting.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>
                Generate insights from community data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access detailed reports and analytics to make informed decisions
                about community development and resource allocation.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-card py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl">
              About Barangay Konek
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Barangay Konek is designed to modernize barangay operations through digital transformation.
              Our platform helps barangay officials provide better services to residents while maintaining
              transparency and efficiency in governance.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">
                  Get Started Today
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 flex items-center space-x-3 md:mb-0">
              <Image
                src="/logo.svg"
                alt="Barangay Konek Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-lg font-semibold text-foreground">Barangay Konek</span>
            </div>
            <p className="text-muted-foreground">
              © 2025 Barangay Konek by Hacktabang. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
