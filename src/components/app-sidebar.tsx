"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  UserCheck,
  User,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { Database } from "../../database.types"

type User = Database['public']['Tables']['mUsers']['Row']

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: User
}

// Get navigation items based on user type
const getNavigationItems = (userType: string) => {
  // const isDev = process.env.NODE_ENV === 'development'

  // if (isDev) {
  //   // In development, show all navigation items for testing
  //   return [
  //     { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  //     { title: "Official", url: "/official", icon: Building },
  //     { title: "Resident", url: "/resident", icon: Home },
  //     { title: "Users", url: "/admin/users", icon: Users },
  //     { title: "Requests", url: "/admin/requests", icon: ClipboardList },
  //     { title: "Certificates", url: "/admin/certificates", icon: FileText },
  //     { title: "Officials", url: "/admin/officials", icon: UserCheck },
  //   ]
  // }

  // Production navigation based on user type
  switch (userType) {
    case "super_admin":
      return [
        { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
        { title: "Users", url: "/admin/users", icon: Users },
        { title: "Requests", url: "/admin/requests", icon: ClipboardList },
        { title: "Certificates", url: "/admin/certificates", icon: FileText },
        { title: "Officials", url: "/admin/officials", icon: UserCheck },
      ]
    case "official":
      return [
        { title: "Dashboard", url: "/official", icon: LayoutDashboard },
        { title: "Requests", url: "/official/requests", icon: ClipboardList },
        { title: "Certificates", url: "/official/certificates", icon: FileText },
        { title: "Residents", url: "/official/residents", icon: Users },
      ]
    case "resident":
      return [
        { title: "Dashboard", url: "/resident", icon: LayoutDashboard },
        { title: "Requests", url: "/resident/requests", icon: ClipboardList },
        { title: "Certificates", url: "/resident/certificates", icon: FileText },
      ]
    default:
      return []
  }
}


export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const navigationItems = user ? getNavigationItems(user.user_type) : []

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image
                    src="/logo.svg"
                    alt="Barangay Konek Logo"
                    width={16}
                    height={16}
                    className="size-4"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Barangay Konek</span>
                  <span className="truncate text-xs">
                    {user?.user_type === "super_admin" ? "Admin Panel" :
                      user?.user_type === "official" ? "Official Panel" :
                        user?.user_type === "resident" ? "Resident Portal" : "Dashboard"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationItems} />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  )
}
