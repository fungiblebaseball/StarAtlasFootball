import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PerkCardProps {
  name: string;
  description: string;
  price: number;
  icon: string;
  owned?: boolean;
  onPurchase?: () => void;
}

export default function PerkCard({ name, description, price, icon, owned = false, onPurchase }: PerkCardProps) {
  return (
    <Card className={`p-6 relative ${owned ? 'opacity-60' : 'hover-elevate'}`} data-testid="card-perk">
      {owned && (
        <div className="absolute top-2 right-2">
          <Badge className="bg-green-500 text-white" data-testid="badge-owned">
            <Check className="h-3 w-3 mr-1" />
            Owned
          </Badge>
        </div>
      )}
      
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="text-6xl" data-testid="icon-perk">{icon}</div>
        <div>
          <h3 className="font-heading font-semibold text-lg mb-2" data-testid="text-perk-name">{name}</h3>
          <p className="text-sm text-muted-foreground mb-4" data-testid="text-perk-description">{description}</p>
        </div>
        <div className="w-full pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Price</span>
            <span className="font-mono font-bold text-lg" data-testid="text-perk-price">{price} ATLAS</span>
          </div>
          <Button 
            className="w-full" 
            disabled={owned}
            onClick={onPurchase}
            data-testid="button-purchase"
          >
            {owned ? 'Already Owned' : 'Purchase'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
