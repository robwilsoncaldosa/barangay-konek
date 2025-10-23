import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-20">
      <div className="mx-auto max-w-4xl text-center">
        {/* Globe Illustration */}
        <div className="flex justify-center mb-8 md:mb-12">
          <Image
            src="/3D Graphics.svg"
            alt="Digital Management System Illustration"
            width={400}
            height={300}
            className="h-auto w-full max-w-xs md:max-w-sm"
            priority
          />
        </div>

        {/* Content */}
        <div className="space-y-6 md:space-y-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground">
            Digital Management System
          </h1>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Streamline your barangay operations with our comprehensive digital platform. Manage 
            residents, handle requests, and improve community services efficiently.
          </p>

          <div className="flex justify-center">
            <Button size="lg" className="text-white px-6 md:px-8 py-2 md:py-3 bg-primary hover:bg-primary/90" asChild>
              <Link href="/register">
                Start Free Trial
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}