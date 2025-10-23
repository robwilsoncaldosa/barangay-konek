"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LogOut,
  Home,
  Menu,
  X,
  ChevronDown,
  Bell
} from "lucide-react"
import { cn } from "@/lib/utils"
import { logoutUser } from "@/server/auth"

interface NavbarActionsProps {
  user: {
    id: number
    email: string
    user_type: "super_admin" | "official" | "resident"
  }
  className?: string
}

export function NavbarActions({ user, className }: NavbarActionsProps) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      // Use the server action instead of API call
      const result = await logoutUser()

      if (!result.success) {
        console.error('Logout error:', result.error)
      }
    } catch (error) {
      console.error('Logout error:', error)
    }

    // Redirect to the appropriate login page based on role
    if (user.user_type === "super_admin") {
      router.push("/admin/login")
    } else if (user.user_type === "official") {
      router.push("/official/login")
    } else {
      router.push("/login") // resident or default
    }
  }

  const handleDashboardNavigation = () => {
    if (user.user_type === "super_admin") {
      router.push("/admin")
    } else if (user.user_type === "official") {
      router.push("/official")
    } else if (user.user_type === "resident") {
      router.push("/resident")
    } else {
      router.push("/") // fallback
    }
  }

  const getDashboardLabel = () => {
    switch (user.user_type) {
      case "super_admin":
        return "Admin Dashboard"
      case "official":
        return "Official Dashboard"
      case "resident":
        return "Resident Dashboard"
      default:
        return "Dashboard"
    }
  }

  const getUserTypeLabel = () => {
    switch (user.user_type) {
      case "super_admin":
        return "Super Admin"
      case "official":
        return "Official"
      case "resident":
        return "Resident"
      default:
        return "User"
    }
  }

  const getUserInitials = () => {
    return user.email.substring(0, 2).toUpperCase()
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-3">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground transition-colors h-9 w-9 p-0"
        >
          <Bell className="w-4 h-4" />
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors h-9 px-3"
            >
              <Avatar className="w-7 h-7">
                <AvatarImage src="" alt={user.email} />
                <AvatarFallback className="bg-blue-600 text-white text-xs">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{getUserTypeLabel()}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDashboardNavigation}>
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-muted-foreground hover:text-foreground h-9 w-9 p-0"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile Menu */}
          <div className="fixed top-16 right-4 left-4 bg-slate-900 border border-slate-700 rounded-lg shadow-lg z-50 md:hidden">
            <div className="p-4 space-y-3">
              {/* User Info */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="" alt={user.email} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getUserTypeLabel()}
                  </p>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleDashboardNavigation()
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full justify-start text-muted-foreground hover:text-foreground h-9"
                >
                  <Home className="w-4 h-4 mr-3" />
                  {getDashboardLabel()}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleLogout()
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full justify-start text-muted-foreground hover:text-red-400 h-9"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}