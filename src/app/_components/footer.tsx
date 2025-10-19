import Image from 'next/image'

export function Footer() {
  return (
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
  )
}