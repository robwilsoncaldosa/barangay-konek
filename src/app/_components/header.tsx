import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function Header() {
    return (
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
    )
}