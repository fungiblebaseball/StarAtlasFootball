import { useState } from "react";
import CrewCard from "@/components/CrewCard";
import FormationSelector from "@/components/FormationSelector";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Roster() {
  const [selectedFormation, setSelectedFormation] = useState("442");
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const { toast } = useToast();

  // TODO: remove mock functionality - Replace with real Star Atlas crew data from API
  const mockCrew = [
    { dasID: "1", name: "Nova Striker", image: "https://images.unsplash.com/photo-1534126511673-b6899657816a?w=400&h=600&fit=crop", rarity: "Legendary" as const, position: "FWD" as const, number: 9, stats: { defense: 45, attack: 95, stamina: 78 }, isStarting: true },
    { dasID: "2", name: "Galaxy Keeper", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop", rarity: "Epic" as const, position: "GK" as const, number: 1, stats: { defense: 88, attack: 35, stamina: 82 }, isStarting: true },
    { dasID: "3", name: "Cosmic Guardian", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop", rarity: "Epic" as const, position: "DEF" as const, number: 4, stats: { defense: 92, attack: 58, stamina: 85 }, isStarting: true },
    { dasID: "4", name: "Stellar Playmaker", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop", rarity: "Rare" as const, position: "MID" as const, number: 8, stats: { defense: 68, attack: 75, stamina: 88 }, isStarting: true },
    { dasID: "5", name: "Void Defender", image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop", rarity: "Rare" as const, position: "DEF" as const, number: 5, stats: { defense: 87, attack: 52, stamina: 80 }, isStarting: true },
    { dasID: "6", name: "Pulsar Winger", image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=600&fit=crop", rarity: "Uncommon" as const, position: "MID" as const, stats: { defense: 60, attack: 72, stamina: 85 } },
    { dasID: "7", name: "Orion Forward", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop", rarity: "Uncommon" as const, position: "FWD" as const, stats: { defense: 42, attack: 82, stamina: 76 } },
    { dasID: "8", name: "Nebula Midfielder", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=600&fit=crop", rarity: "Common" as const, position: "MID" as const, stats: { defense: 65, attack: 68, stamina: 82 } },
  ];

  const filteredCrew = mockCrew.filter(crew => {
    const matchesSearch = crew.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = positionFilter === "all" || crew.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  const handleSaveTeam = () => {
    console.log("Saving team with formation:", selectedFormation);
    toast({
      title: "Team Saved",
      description: "Your squad and formation have been updated successfully.",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-bold text-4xl mb-2" data-testid="text-page-title">Roster</h1>
        <p className="text-muted-foreground" data-testid="text-page-subtitle">
          Build your ultimate Star Atlas crew team
        </p>
      </div>

      <div>
        <h2 className="font-heading font-semibold text-xl mb-4" data-testid="text-formation-title">Select Formation</h2>
        <FormationSelector 
          selected={selectedFormation}
          onSelect={setSelectedFormation}
        />
      </div>

      <div className="flex gap-4 flex-wrap items-center justify-between">
        <div className="flex gap-4 flex-1 max-w-2xl flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search crew members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-position">
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              <SelectItem value="GK">Goalkeeper</SelectItem>
              <SelectItem value="DEF">Defender</SelectItem>
              <SelectItem value="MID">Midfielder</SelectItem>
              <SelectItem value="FWD">Forward</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSaveTeam} data-testid="button-save-team">
          <Save className="mr-2 h-4 w-4" />
          Save Team
        </Button>
      </div>

      <div>
        <h3 className="font-heading font-semibold text-lg mb-4 text-muted-foreground" data-testid="text-starting-xi">
          Starting XI (First 5 shown)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredCrew
            .filter(crew => crew.isStarting)
            .map((crew) => (
              <CrewCard
                key={crew.dasID}
                {...crew}
                onSelect={() => console.log('Selected:', crew.name)}
              />
            ))}
        </div>
      </div>

      <div>
        <h3 className="font-heading font-semibold text-lg mb-4 text-muted-foreground" data-testid="text-available">
          Available Crew
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredCrew
            .filter(crew => !crew.isStarting)
            .map((crew) => (
              <CrewCard
                key={crew.dasID}
                {...crew}
                onSelect={() => console.log('Selected:', crew.name)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
