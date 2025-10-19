import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function AboutSection() {
  return (
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
  )
}