
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
  Landmark,
  User as UserIcon,
  PieChart,
  Wallet
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
  SidebarGroupLabel,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { useDoc, useUser, useAuth, useCollection } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { doc, collection } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { initiateSignOut } from "@/firebase/non-blocking-login";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  { name: "Audit Cards", href: "/dashboard/admin/cards", icon: CreditCard },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();

  // Profile data fetch for Sidebar Basic Info
  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);
  const { data: profile } = useDoc(profileRef);

  // Accounts fetch for Sidebar Summary
  const accountsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "users", user.uid, "accounts");
  }, [db, user?.uid]);
  const { data: accounts } = useCollection(accountsRef);

  const adminRoleRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "roles_admin", user.uid);
  }, [db, user?.uid]);

  const { data: adminRole } = useDoc(adminRoleRef);
  const isMasterAdmin = user?.email === "citybank@gmail.com";
  const isAdmin = isMasterAdmin || !!adminRole;

  const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;

  const handleLogout = async () => {
    try {
      await initiateSignOut(auth);
      router.replace("/");
    } catch (e) {
      console.error("Logout failed", e);
      router.replace("/");
    }
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
        {/* Basic Information Section - Clickable Link to Settings */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel className="text-sidebar-foreground/50">Account Profile</SidebarGroupLabel>
          <Link href="/dashboard/settings" className="block outline-none">
            <div className="px-2 py-3 flex items-center gap-3 bg-white/5 rounded-xl border border-white/5 mb-2 hover:bg-white/10 transition-colors cursor-pointer group">
              <Avatar className="h-10 w-10 border border-white/20 group-hover:border-accent/50 transition-colors">
                <AvatarImage src={profile?.profilePictureUrl || user?.photoURL || ""} className="object-cover" />
                <AvatarFallback className="bg-accent text-white text-xs font-bold">
                  {profile?.firstName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate group-hover:text-accent transition-colors">
                  {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : (user?.displayName || "Member")}
                </span>
                <span className="text-[10px] text-sidebar-foreground/60 truncate font-mono">
                  {profile?.username || user?.email?.split('@')[0]}
                </span>
              </div>
            </div>
          </Link>
        </SidebarGroup>

        <SidebarSeparator className="mx-2 opacity-10" />

        {/* Account Summary Section - Clickable Link to Settings */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel className="text-sidebar-foreground/50">Financial Summary</SidebarGroupLabel>
          <Link href="/dashboard/settings" className="block outline-none">
            <div className="px-3 py-4 bg-accent/10 rounded-xl border border-accent/20 space-y-3 mb-2 hover:bg-accent/20 transition-colors cursor-pointer group">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-black tracking-widest text-accent">Total Capital</span>
                <Wallet className="h-3 w-3 text-accent group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-lg font-black text-white">
                ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="space-y-1 mt-2">
                {accounts?.slice(0, 2).map(acc => (
                  <div key={acc.id} className="flex justify-between text-[10px] font-medium text-sidebar-foreground/70">
                    <span>{acc.accountType}</span>
                    <span className="text-white">${acc.balance?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        </SidebarGroup>

        <SidebarSeparator className="mx-2 opacity-10" />

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
