
"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ChatbotWidget } from "@/components/chatbot-widget";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthReady } = useUser();
  const router = useRouter();
  const db = useFirestore();

  // Fetch real-time Firestore profile
  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  useEffect(() => {
    if (isAuthReady && !user) {
      router.replace("/auth");
    }
  }, [user, isAuthReady, router]);

  const displayName = useMemo(() => {
    if (profile?.firstName) {
      return `${profile.firstName} ${profile.lastName || ''}`.trim();
    }
    return user?.displayName || user?.email?.split('@')[0] || "Institutional Client";
  }, [profile, user]);

  if (!isAuthReady) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Initializing Institutional Core...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background overflow-hidden relative">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden min-w-0">
          <header className="flex h-16 shrink-0 items-center border-b bg-white px-4 sm:px-6 gap-4 sticky top-0 z-30 shadow-sm">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-3 sm:gap-4">
              <LanguageSwitcher />
              <div className="flex items-center gap-3">
                <div className="text-[10px] sm:text-sm font-bold truncate max-w-[120px] sm:max-w-none text-primary">
                  {isProfileLoading ? <Skeleton className="h-4 w-24" /> : displayName}
                </div>
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs border border-primary/20 shrink-0 overflow-hidden">
                  {isProfileLoading ? (
                    <Skeleton className="h-full w-full rounded-full" />
                  ) : profile?.profilePictureUrl ? (
                    <img src={profile.profilePictureUrl} className="h-full w-full object-cover" alt="Profile" />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50">
            {children}
          </main>
        </SidebarInset>
        <ChatbotWidget />
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
