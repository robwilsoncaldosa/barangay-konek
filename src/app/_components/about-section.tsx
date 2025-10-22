import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function AboutSection() {
  return (
    <section className="bg-card py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left side - Graphics */}
          <div className="flex justify-center lg:justify-start order-2 lg:order-1">
            <Image
              src="/Graphics- About us.svg"
              alt="About Barangay Konek"
              width={500}
              height={400}
              className="h-auto w-full max-w-sm md:max-w-md"
            />
          </div>

          {/* Right side - Content */}
          <div className="text-center lg:text-left order-1 lg:order-2">
            <h2 className="mb-4 md:mb-6 text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              Empowering Communities
            </h2>
            <p className="mb-6 md:mb-8 text-base md:text-lg text-muted-foreground leading-relaxed">
              We believe every barangay deserves modern tools to serve their people better. 
              Our platform bridges the gap between traditional governance and digital innovation, 
              creating transparent, efficient, and accessible community services.
            </p>
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 md:gap-4 justify-center lg:justify-start">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/register">
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}