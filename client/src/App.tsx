import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import { WalletProvider } from "@/lib/wallet-context";

import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Roster from "@/pages/Roster";
import Matches from "@/pages/Matches";
import Rankings from "@/pages/Rankings";
import Perks from "@/pages/Perks";
import ProfileSelector from "@/pages/ProfileSelector";
import NotFound from "@/pages/not-found";

function AppLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/profile-selector">
        <AppLayout>
          <ProfileSelector />
        </AppLayout>
      </Route>
      <Route path="/dashboard">
        <AppLayout>
          <Dashboard />
        </AppLayout>
      </Route>
      <Route path="/roster">
        <AppLayout>
          <Roster />
        </AppLayout>
      </Route>
      <Route path="/matches">
        <AppLayout>
          <Matches />
        </AppLayout>
      </Route>
      <Route path="/rankings">
        <AppLayout>
          <Rankings />
        </AppLayout>
      </Route>
      <Route path="/perks">
        <AppLayout>
          <Perks />
        </AppLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}
