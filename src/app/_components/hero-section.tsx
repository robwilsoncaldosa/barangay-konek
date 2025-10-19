import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
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
  )
}