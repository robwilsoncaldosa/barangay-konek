import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { NavbarActions } from "./navbar-actions"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  UserCheck,
  ClipboardList,
  Home,
  Building
} from "lucide-react"

export interface NavbarProps {
  className?: string
  variant?: "default" | "transparent" | "solid" | "dark"
  size?: "sm" | "md" | "lg"
  showLogo?: boolean
  logoSrc?: string
  logoAlt?: string
  title?: string
  titleHref?: string
  user?: {
    id: number
    email: string
    user_type: "super_admin" | "official" | "resident"
  } | null
  customActions?: React.ReactNode
  hideDefaultActions?: boolean
  position?: "static" | "sticky" | "fixed"
  children?: React.ReactNode
}

interface NavLinkProps {
  href: string
  children: React.ReactNode
  variant?: "default" | "ghost" | "outline"
  className?: string
  icon?: React.ReactNode
}

function NavLink({ href, children, variant = "ghost", className, icon }: NavLinkProps) {
  return (
    <Button
      asChild
      variant={variant}
      size="sm"
      className={cn(
        "text-muted-foreground hover:text-foreground transition-colors h-9",
        className
      )}
    >
      <Link href={href} className="flex items-center gap-2">
        {icon}
        {children}
      </Link>
    </Button>
  )
}

export function Navbar({
  className,
  variant = "dark",
  size = "md",
  showLogo = true,
  logoSrc = "/logo.png",
  logoAlt = "Logo",
  title = "Barangay Konek",
  titleHref = "/",
  user = null,
  customActions,
  hideDefaultActions = false,
  position = "static",
  children,
}: NavbarProps) {
  const variantStyles = {
    default: "bg-background border-b border-border",
    transparent: "bg-transparent",
    solid: "bg-primary text-primary-foreground",
    dark: "bg-slate-900 border-b border-slate-800 text-foreground",
  }

  const sizeStyles = {
    sm: "h-12 px-4",
    md: "h-16 px-6",
    lg: "h-20 px-8",
  }

  const positionStyles = {
    static: "",
    sticky: "sticky top-0 z-50",
    fixed: "fixed top-0 left-0 right-0 z-50",
  }

  // Simple navigation items - show all in development mode
  const getNavigationItems = (userType: string) => {
    const isDev = process.env.NODE_ENV === 'development'

    if (isDev) {
      // In development, show all navigation items for testing
      return [
        { href: "/admin", label: "Admin", icon: LayoutDashboard },
        { href: "/official", label: "Official", icon: Building },
        { href: "/resident", label: "Resident", icon: Home },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/requests", label: "Requests", icon: ClipboardList },
        { href: "/admin/certificates", label: "Certificates", icon: FileText },
        { href: "/admin/officials", label: "Officials", icon: UserCheck },
      ]
    }

    // Production navigation based on user type
    switch (userType) {
      case "super_admin":
        return [
          { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
          { href: "/admin/users", label: "Users", icon: Users },
          { href: "/admin/requests", label: "Requests", icon: ClipboardList },
          { href: "/admin/certificates", label: "Certificates", icon: FileText },
          { href: "/admin/officials", label: "Officials", icon: UserCheck },
          { href: "/admin/settings", label: "Settings", icon: Settings },
        ]
      case "official":
        return [
          { href: "/official", label: "Dashboard", icon: LayoutDashboard },
          { href: "/official/requests", label: "Requests", icon: ClipboardList },
          { href: "/official/certificates", label: "Certificates", icon: FileText },
        ]
      case "resident":
        return [
          { href: "/resident", label: "Dashboard", icon: Home },
          { href: "/resident/requests", label: "My Requests", icon: ClipboardList },
          { href: "/resident/certificates", label: "My Certificates", icon: FileText },
        ]
      default:
        return []
    }
  }

  const navigationItems = user ? getNavigationItems(user.user_type) : []

  return (
    <nav
      className={cn(
        "w-full flex items-center justify-between",
        variantStyles[variant],
        sizeStyles[size],
        positionStyles[position],
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo and Title Section - Left */}
      <div className="flex items-center">
        {showLogo && (
          <Link
            href={titleHref}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            aria-label={`${title} - Go to homepage`}
          >
            <div className="relative w-12 h-12 md:w-14 md:h-14">
              <Image
                src={logoSrc}
                alt={logoAlt}
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-xl md:text-2xl text-foreground">
              {title}
            </span>
          </Link>
        )}
        {!showLogo && title && (
          <Link
            href={titleHref}
            className="font-bold text-xl md:text-2xl text-foreground hover:text-blue-400 transition-colors"
            aria-label={`${title} - Go to homepage`}
          >
            {title}
          </Link>
        )}
      </div>

      {/* Center Navigation Menu */}
      <div className="flex-1 flex justify-center">
        {user && navigationItems.length > 0 && (
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {/* Icon + Label side-by-side */}
                      <span>{item.label}</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        )}
        {/* Center Content */}
        {children && (
          <div className="hidden md:flex items-center gap-2">
            {children}
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-2">
        <AnimatedThemeToggler
          className="h-9 w-9 p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
          aria-label="Toggle theme"
        />
        {customActions}
        {!hideDefaultActions && (
          <>
            {!user ? (
              // Guest Navigation
              <div className="hidden sm:flex items-center gap-2">
                <NavLink href="/login">Resident Login</NavLink>
                <NavLink href="/official/login">Official Login</NavLink>
                <NavLink href="/admin/login">Admin Login</NavLink>
                <NavLink href="/register" variant="default">
                  Sign Up
                </NavLink>
              </div>
            ) : (
              // Authenticated User Navigation
              <NavbarActions user={user} />
            )}
          </>
        )}
      </div>
    </nav>
  )
}

// Export NavLink for external use
export { NavLink }