import { useState } from "react";
import { useLocation } from "wouter";
import WalletConnectButton from "@/components/WalletConnectButton";
import { Card } from "@/components/ui/card";
import { Users, Trophy, Coins } from "lucide-react";
import heroImage from "@assets/generated_images/Futuristic_football_stadium_cosmic_background_61145702.png";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    console.log("Connecting to Phantom wallet...");
    // TODO: remove mock functionality - Simulate wallet connection
    setTimeout(() => {
      setConnecting(false);
      console.log("Wallet connected!");
      setLocation("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
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
          
          {connecting ? (
            <div className="flex items-center justify-center gap-2 text-white">
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Connecting wallet...</span>
            </div>
          ) : (
            <WalletConnectButton onConnect={handleConnect} />
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
