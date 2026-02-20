
"use client";

import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Receipt, 
  History, 
  CreditCard, 
  Settings, 
  LogOut,
  Building2
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel
} from "@/components/ui/sidebar";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transfers", href: "/dashboard/transfer", icon: ArrowLeftRight },
  { name: "Bill Payments", href: "/dashboard/bills", icon: Receipt },
  { name: "Transactions", href: "/dashboard/transactions", icon: History },
  { name: "Cards", href: "/dashboard/cards", icon: CreditCard },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4 flex flex-row items-center gap-2">
        <div className="bg-accent p-2 rounded-lg">
          <Building2 className="text-white h-6 w-6" />
        </div>
        <span className="font-headline font-bold text-xl tracking-tight group-data-[collapsible=icon]:hidden">
          NEXA
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Banking</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.href}
                  tooltip={item.name}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Logout" className="text-red-400 hover:text-red-300">
              <Link href="/">
                <LogOut />
                <span>Logout</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
