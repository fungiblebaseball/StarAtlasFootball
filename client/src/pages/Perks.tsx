import { useState } from "react";
import PerkCard from "@/components/PerkCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function Perks() {
  const { toast } = useToast();
  const [ownedPerks, setOwnedPerks] = useState<Set<string>>(new Set(["iron-defense"]));

  // TODO: remove mock functionality - Replace with real perks data and Solana transactions
  const mockPerks = [
    { id: "counter-strike", name: "Counter Strike", description: "+15% chance for successful counterattacks", price: 50, icon: "⚡" },
    { id: "iron-defense", name: "Iron Defense", description: "+20% defensive strength and blocking", price: 75, icon: "🛡️" },
    { id: "goal-machine", name: "Goal Machine", description: "+10% finishing accuracy in the box", price: 100, icon: "⚽" },
    { id: "stamina-boost", name: "Stamina Boost", description: "+25% player stamina throughout match", price: 60, icon: "💪" },
    { id: "tactical-mind", name: "Tactical Mind", description: "+10% all tactical stats", price: 150, icon: "🧠" },
    { id: "speed-demon", name: "Speed Demon", description: "+20% counter attack speed", price: 80, icon: "💨" },
  ];

  const handlePurchase = (perkId: string, perkName: string, price: number) => {
    console.log(`Initiating Solana transaction for ${perkName} (${price} ATLAS)`);
    // Simulate purchase
    setOwnedPerks(new Set([...Array.from(ownedPerks), perkId]));
    toast({
      title: "Perk Purchased!",
      description: `${perkName} has been added to your collection.`,
    });
  };

  const ownedPerksList = mockPerks.filter(p => ownedPerks.has(p.id));
  const availablePerks = mockPerks.filter(p => !ownedPerks.has(p.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-bold text-4xl mb-2" data-testid="text-page-title">Perks Marketplace</h1>
        <p className="text-muted-foreground" data-testid="text-page-subtitle">
          Purchase tactical advantages with $ATLAS tokens
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-heading font-semibold text-lg mb-1" data-testid="text-balance-title">Your Balance</h3>
            <div className="font-mono text-3xl font-bold" data-testid="text-balance">1,250 ATLAS</div>
          </div>
          <div>
            <Badge variant="secondary" className="text-sm" data-testid="badge-owned-count">
              {ownedPerks.size} Perks Owned
            </Badge>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="marketplace" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="marketplace" data-testid="tab-marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="owned" data-testid="tab-owned">My Perks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="marketplace" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availablePerks.map((perk) => (
              <PerkCard
                key={perk.id}
                {...perk}
                onPurchase={() => handlePurchase(perk.id, perk.name, perk.price)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="owned" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownedPerksList.map((perk) => (
              <PerkCard
                key={perk.id}
                {...perk}
                owned
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
