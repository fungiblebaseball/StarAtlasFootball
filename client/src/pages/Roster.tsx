import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Search, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { config } from "@/lib/config";

// Player profile ID from config (can be overridden via environment variable)
const PLAYER_PROFILE_ID = config.playerProfileId;

interface CrewMember {
  dasID: string;
  name: string;
  faction: string;
  species: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  imageUrl?: string;
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  defense: number;
  attack: number;
  stamina: number;
}

export default function Roster() {
  const [selectedFormation, setSelectedFormation] = useState("442");
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [selectedCrew, setSelectedCrew] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Fetch crew data from Star Atlas API
  const { data: crewData, isLoading, refetch, isFetching } = useQuery<{ total: number; crew: CrewMember[]; profileId: string }>({
    queryKey: ["/api/crew", { profileId: PLAYER_PROFILE_ID }],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const crew = crewData?.crew || [];

  // Assign positions based on personality traits
  const getPosition = (member: CrewMember): "GK" | "DEF" | "MID" | "FWD" => {
    // Goalkeeper: High conscientiousness, low neuroticism
    if (member.conscientiousness > 0.7 && member.neuroticism < 0.3) {
      return "GK";
    }
    // Defender: High conscientiousness and agreeableness
    if (member.conscientiousness > 0.6 && member.agreeableness > 0.5) {
      return "DEF";
    }
    // Forward: High extraversion and openness
    if (member.extraversion > 0.6 && member.openness > 0.5) {
      return "FWD";
    }
    // Midfielder: Default
    return "MID";
  };

  const enrichedCrew = crew.map((member, index) => ({
    ...member,
    position: getPosition(member),
    number: index + 1,
    isStarting: index < 11, // First 11 are starting
  }));

  const filteredCrew = enrichedCrew.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = positionFilter === "all" || member.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  const handleSaveTeam = () => {
    console.log("Saving team with formation:", selectedFormation);
    console.log("Selected crew:", Array.from(selectedCrew));
    toast({
      title: "Team Saved",
      description: "Your squad and formation have been updated successfully.",
    });
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing Crew",
      description: "Fetching latest data from Star Atlas...",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-heading font-bold text-4xl mb-2">Roster</h1>
          <p className="text-muted-foreground">Loading Star Atlas crew data...</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[3/4] w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading font-bold text-4xl mb-2" data-testid="text-page-title">Roster</h1>
          <p className="text-muted-foreground" data-testid="text-page-subtitle">
            {crew.length} Star Atlas crew members from profile {PLAYER_PROFILE_ID.slice(0, 8)}...
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          disabled={isFetching}
          data-testid="button-refresh"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh from API
        </Button>
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
          Starting XI
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredCrew
            .filter(member => member.isStarting)
            .map((member) => (
              <CrewCard
                key={member.dasID}
                dasID={member.dasID}
                name={member.name}
                image={member.imageUrl || `https://images.unsplash.com/photo-1534126511673-b6899657816a?w=400&h=600&fit=crop`}
                rarity={member.rarity}
                position={member.position}
                number={member.number}
                stats={{
                  defense: member.defense,
                  attack: member.attack,
                  stamina: member.stamina,
                }}
                isStarting
                onSelect={() => {
                  const newSelected = new Set(selectedCrew);
                  if (newSelected.has(member.dasID)) {
                    newSelected.delete(member.dasID);
                  } else {
                    newSelected.add(member.dasID);
                  }
                  setSelectedCrew(newSelected);
                }}
              />
            ))}
        </div>
      </div>

      <div>
        <h3 className="font-heading font-semibold text-lg mb-4 text-muted-foreground" data-testid="text-available">
          Available Crew ({filteredCrew.filter(m => !m.isStarting).length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredCrew
            .filter(member => !member.isStarting)
            .map((member) => (
              <CrewCard
                key={member.dasID}
                dasID={member.dasID}
                name={member.name}
                image={member.imageUrl || `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop`}
                rarity={member.rarity}
                position={member.position}
                stats={{
                  defense: member.defense,
                  attack: member.attack,
                  stamina: member.stamina,
                }}
                onSelect={() => {
                  const newSelected = new Set(selectedCrew);
                  if (newSelected.has(member.dasID)) {
                    newSelected.delete(member.dasID);
                  } else {
                    newSelected.add(member.dasID);
                  }
                  setSelectedCrew(newSelected);
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
