import Image from 'next/image'

export function BrandingSection() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center">
      <div className="relative w-[60%] h-[60%]">
        <Image
          src="/3D Graphics.svg"
          alt="Login Illustration"
          fill
        />
      </div>
    </div>
  )
}