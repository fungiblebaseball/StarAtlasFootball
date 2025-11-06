import { useState } from "react";
import { Home, Users, Calendar, Trophy, ShoppingBag, Wallet, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useWallet } from "@/lib/wallet-context";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { WalletSelector } from "@/components/WalletSelector";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Roster", url: "/roster", icon: Users },
  { title: "Matches", url: "/matches", icon: Calendar },
  { title: "Rankings", url: "/rankings", icon: Trophy },
  { title: "Perks", url: "/perks", icon: ShoppingBag },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { connected, walletAddress, disconnect, walletType } = useWallet();
  const [showWalletSelector, setShowWalletSelector] = useState(false);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDisconnect = () => {
    disconnect();
    setLocation("/");
  };

  return (
    <Sidebar>
      <SidebarContent className="p-4">
        <div className="mb-6 px-2">
          <h2 className="font-heading font-bold text-2xl" data-testid="text-app-title">Galia Football</h2>
          <p className="text-xs text-muted-foreground" data-testid="text-app-subtitle">Star Atlas Manager</p>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase()}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-3">
        {connected && walletAddress ? (
          <>
            <Card className="p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" data-testid="text-wallet">
                    {truncateAddress(walletAddress)}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize" data-testid="text-connected">
                    {walletType} wallet
                  </div>
                </div>
              </div>
            </Card>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              className="w-full"
              data-testid="button-sidebar-disconnect"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          </>
        ) : (
          <>
            <Card 
              className="p-3 cursor-pointer hover-elevate" 
              onClick={() => setShowWalletSelector(true)}
              data-testid="card-connect-wallet"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" data-testid="text-wallet">Not connected</div>
                  <div className="text-xs text-muted-foreground">Connect wallet</div>
                </div>
              </div>
            </Card>
            <WalletSelector 
              open={showWalletSelector} 
              onOpenChange={setShowWalletSelector}
            />
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
