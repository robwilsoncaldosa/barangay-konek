import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-card border-t py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <div className="flex items-center">
            <Image
              src="/Barangay Konek  - Blue text.svg"
              alt="Barangay Konek Logo"
              width={150}
              height={40}
              className="h-6 md:h-8 w-auto"
            />
          </div>
          <p className="text-sm md:text-base text-muted-foreground text-center md:text-right">
            © 2025 Barangay Konek by Hacktabang. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}