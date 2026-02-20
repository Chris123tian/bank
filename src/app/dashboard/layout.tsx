
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ChatbotWidget } from "@/components/chatbot-widget";
import { Toaster } from "@/components/ui/toaster";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="flex h-16 items-center border-b bg-white px-6 gap-4">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-4">
              <div className="text-sm font-medium hidden sm:block">
                Welcome back, Alex Thompson
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs border border-primary/20">
                AT
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
