import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Heart } from "lucide-react";

interface CrewCardProps {
  dasID: string;
  name: string;
  image: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  position?: "GK" | "DEF" | "MID" | "FWD";
  number?: number;
  stats?: {
    defense: number;
    attack: number;
    stamina: number;
  };
  isStarting?: boolean;
  onSelect?: () => void;
}

export default function CrewCard({
  name,
  image,
  rarity,
  position,
  number,
  stats,
  isStarting = false,
  onSelect
}: CrewCardProps) {
  const rarityColors = {
    Common: "bg-gray-500",
    Uncommon: "bg-green-500",
    Rare: "bg-blue-500",
    Epic: "bg-purple-500",
    Legendary: "bg-yellow-500"
  };

  return (
    <Card 
      className={`relative overflow-hidden cursor-pointer hover-elevate active-elevate-2 transition-transform ${
        isStarting ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onSelect}
      data-testid={`card-crew-${name.toLowerCase().replace(/\s/g, '-')}`}
    >
      <div className="aspect-[3/4] relative">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
          data-testid="img-crew"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {number !== undefined && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center font-bold font-mono" data-testid="text-number">
            {number}
          </div>
        )}
        
        <Badge 
          className={`absolute top-2 right-2 ${rarityColors[rarity]} text-white border-0 text-xs`}
          data-testid="badge-rarity"
        >
          {rarity}
        </Badge>

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="font-heading font-semibold text-lg text-white mb-1" data-testid="text-name">
                {name}
              </h3>
              {stats && (
                <div className="flex gap-2 text-xs text-white/90">
                  <div className="flex items-center gap-1" data-testid="stat-defense">
                    <Shield className="h-3 w-3" />
                    <span className="font-mono">{stats.defense}</span>
                  </div>
                  <div className="flex items-center gap-1" data-testid="stat-attack">
                    <Zap className="h-3 w-3" />
                    <span className="font-mono">{stats.attack}</span>
                  </div>
                  <div className="flex items-center gap-1" data-testid="stat-stamina">
                    <Heart className="h-3 w-3" />
                    <span className="font-mono">{stats.stamina}</span>
                  </div>
                </div>
              )}
            </div>
            {position && (
              <Badge variant="secondary" className="text-xs" data-testid="badge-position">
                {position}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
