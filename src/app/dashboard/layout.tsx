
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ChatbotWidget } from "@/components/chatbot-widget";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading, isAuthReady } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isAuthReady && !user) {
      router.replace("/auth");
    }
  }, [user, isAuthReady, router]);

  if (!isAuthReady || (isUserLoading && !user)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="flex h-16 items-center border-b bg-white px-6 gap-4">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-4">
              <LanguageSwitcher />
              <div className="text-sm font-medium hidden sm:block">
                Welcome, {user.displayName || user.email?.split('@')[0]}
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs border border-primary/20">
                {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </SidebarInset>
        <ChatbotWidget />
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
