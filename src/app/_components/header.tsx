import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function Header() {
    return (
        <header className="w-full border-b border-border/40">
            <div className="container mx-auto px-4 py-3 md:py-4">
                <nav className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/Barangay Konek  - Blue text.svg"
                            alt="Barangay Konek"
                            width={200}
                            height={50}
                            className="h-8 md:h-16 w-auto"
                            priority
                        />
                    </Link>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <Button variant="ghost" size="sm" className="text-sm md:text-base" asChild>
                            <Link href="/login">Sign In</Link>
                        </Button>
                        <Button size="sm" className="text-sm md:text-base" asChild>
                            <Link href="/register">Get Started</Link>
                        </Button>
                    </div>
                </nav>
            </div>
        </header>
    )
}