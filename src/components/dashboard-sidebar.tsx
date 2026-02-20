"use client";

import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Receipt, 
  History, 
  CreditCard, 
  Settings, 
  LogOut,
  Building2,
  ShieldAlert,
  Users,
  Landmark
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { useDoc, useUser, useAuth } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { initiateSignOut } from "@/firebase/non-blocking-login";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transfers", href: "/dashboard/transfer", icon: ArrowLeftRight },
  { name: "Bill Payments", href: "/dashboard/bills", icon: Receipt },
  { name: "Transactions", href: "/dashboard/transactions", icon: History },
  { name: "Cards", href: "/dashboard/cards", icon: CreditCard },
];

const adminItems = [
  { name: "User Management", href: "/dashboard/admin/users", icon: Users },
  { name: "Audit Accounts", href: "/dashboard/admin/accounts", icon: Landmark },
  { name: "Audit Transactions", href: "/dashboard/admin/transactions", icon: ShieldAlert },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();

  const adminRoleRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "roles_admin", user.uid);
  }, [db, user]);

  const { data: adminRole } = useDoc(adminRoleRef);
  const isAdmin = !!adminRole;

  const handleLogout = () => {
    initiateSignOut(auth);
    router.push("/");
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4 flex flex-row items-center gap-2">
        <div className="bg-accent p-2 rounded-lg">
          <Building2 className="text-white h-6 w-6" />
        </div>
        <span className="font-headline font-bold text-xl tracking-tight group-data-[collapsible=icon]:hidden text-white">
          CITY BANK
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

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50">Administration</SidebarGroupLabel>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    tooltip={item.name}
                    className="text-accent hover:text-accent"
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
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings" isActive={pathname === "/dashboard/settings"}>
              <Link href="/dashboard/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Logout" 
              className="text-red-400 hover:text-red-300"
              onClick={handleLogout}
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}