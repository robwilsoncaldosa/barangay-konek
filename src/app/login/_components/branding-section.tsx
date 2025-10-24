import Image from 'next/image'

export function BrandingSection() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center">
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Title "BARANGAY" */}
        <h1 className="text-6xl font-bold text-blue-600 tracking-wider">
          BARANGAY
        </h1>
        
        {/* Image */}
        <div className="relative w-80 h-80">
          <Image
            src="/3D Graphics.svg"
            alt="Login Illustration"
            fill
            className="object-contain"
          />
        </div>
        
        {/* Subtitle "KONEK" */}
        <h2 className="text-5xl font-bold text-blue-600 tracking-wider">
          KONEK
        </h2>
      </div>
    </div>
  )
}