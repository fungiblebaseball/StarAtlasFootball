import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useWallet } from "@/lib/wallet-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Trophy, Coins, Wallet, LogOut, Calendar } from "lucide-react";
import { WalletSelector } from "@/components/WalletSelector";
import heroImage from "@assets/generated_images/Futuristic_football_stadium_cosmic_background_61145702.png";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { connected, walletAddress, disconnect, walletType } = useWallet();
  const [showWalletSelector, setShowWalletSelector] = useState(false);

  // Redirect to profile selector when wallet is connected
  useEffect(() => {
    if (connected && walletAddress) {
      setLocation("/profile-selector");
    }
  }, [connected, walletAddress, setLocation]);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Public Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-xl" data-testid="text-nav-title">Galia Football</h1>
            </div>
            <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                asChild 
                data-testid="link-nav-matches"
              >
                <a href="/matches">
                  <Calendar className="mr-2 h-4 w-4" />
                  Matches
                </a>
              </Button>
              <Button 
                variant="ghost" 
                asChild 
                data-testid="link-nav-rankings"
              >
                <a href="/rankings">
                  <Trophy className="mr-2 h-4 w-4" />
                  Rankings
                </a>
              </Button>
              {!connected && (
                <Button
                  onClick={() => setShowWalletSelector(true)}
                  data-testid="button-nav-connect"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div 
        className="relative min-h-screen flex items-center justify-center px-4"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="font-heading font-bold text-5xl md:text-7xl text-white mb-6" data-testid="text-hero-title">
            Galia Football
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
            Build your ultimate Star Atlas crew team, compete in tournaments, and earn rewards on Solana
          </p>
          
          {connected ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-white" data-testid="text-wallet-connected">
                <Wallet className="h-5 w-5" />
                <span className="font-medium">{truncateAddress(walletAddress!)}</span>
                <span className="text-xs text-white/60 capitalize">({walletType})</span>
              </div>
              <Button
                size="lg"
                variant="outline"
                onClick={disconnect}
                className="border-white/30 text-white hover:bg-white/20 backdrop-blur-md"
                data-testid="button-disconnect"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Disconnect
              </Button>
            </div>
          ) : (
            <>
              <Button
                size="lg"
                onClick={() => setShowWalletSelector(true)}
                className="h-14 px-8 font-heading text-base"
                data-testid="button-wallet-connect"
              >
                <Wallet className="mr-2 h-5 w-5" />
                Connect Wallet
              </Button>
              <WalletSelector 
                open={showWalletSelector} 
                onOpenChange={setShowWalletSelector}
              />
            </>
          )}
        </div>
      </div>

      <div className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading font-semibold text-3xl text-center mb-12" data-testid="text-features-title">
            Why Play Galia Football?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-8 text-center hover-elevate">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-xl mb-3" data-testid="text-feature-1-title">Build Your Team</h3>
              <p className="text-muted-foreground" data-testid="text-feature-1-desc">
                Select from 100+ Star Atlas crew members and build the perfect squad with tactical formations
              </p>
            </Card>

            <Card className="p-8 text-center hover-elevate">
              <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-xl mb-3" data-testid="text-feature-2-title">Compete in Tournaments</h3>
              <p className="text-muted-foreground" data-testid="text-feature-2-desc">
                Enter girone leagues with Poisson-based match simulation and climb the rankings
              </p>
            </Card>

            <Card className="p-8 text-center hover-elevate">
              <Coins className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-xl mb-3" data-testid="text-feature-3-title">Earn Rewards</h3>
              <p className="text-muted-foreground" data-testid="text-feature-3-desc">
                Purchase tactical perks with $ATLAS tokens and dominate the competition
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
