import RankingsTable from "@/components/RankingsTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Rankings() {
  // TODO: remove mock functionality - Replace with real ranking data from backend
  const mockRankings = [
    { position: 1, teamName: "Stellar Warriors", played: 9, won: 7, drawn: 1, lost: 1, goalsFor: 24, goalsAgainst: 8, goalDifference: 16, points: 22 },
    { position: 2, teamName: "Cosmic Raiders", played: 9, won: 6, drawn: 2, lost: 1, goalsFor: 19, goalsAgainst: 10, goalDifference: 9, points: 20 },
    { position: 3, teamName: "Your Team", played: 9, won: 6, drawn: 1, lost: 2, goalsFor: 21, goalsAgainst: 12, goalDifference: 9, points: 19, isUserTeam: true },
    { position: 4, teamName: "Nebula United", played: 9, won: 5, drawn: 2, lost: 2, goalsFor: 18, goalsAgainst: 11, goalDifference: 7, points: 17 },
    { position: 5, teamName: "Void Strikers", played: 9, won: 4, drawn: 3, lost: 2, goalsFor: 15, goalsAgainst: 13, goalDifference: 2, points: 15 },
    { position: 6, teamName: "Pulsar FC", played: 9, won: 3, drawn: 3, lost: 3, goalsFor: 14, goalsAgainst: 14, goalDifference: 0, points: 12 },
    { position: 7, teamName: "Orion Rovers", played: 9, won: 3, drawn: 2, lost: 4, goalsFor: 12, goalsAgainst: 15, goalDifference: -3, points: 11 },
    { position: 8, teamName: "Andromeda AC", played: 9, won: 2, drawn: 2, lost: 5, goalsFor: 10, goalsAgainst: 17, goalDifference: -7, points: 8 },
    { position: 9, teamName: "Quasar Town", played: 9, won: 1, drawn: 2, lost: 6, goalsFor: 8, goalsAgainst: 20, goalDifference: -12, points: 5 },
    { position: 10, teamName: "Meteor City", played: 9, won: 0, drawn: 2, lost: 7, goalsFor: 5, goalsAgainst: 26, goalDifference: -21, points: 2 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading font-bold text-4xl mb-2" data-testid="text-page-title">Rankings</h1>
          <p className="text-muted-foreground" data-testid="text-page-subtitle">
            Current standings in Girone Level 1
          </p>
        </div>
        <Select defaultValue="girone-1">
          <SelectTrigger className="w-[200px]" data-testid="select-girone">
            <SelectValue placeholder="Select Girone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="girone-1">Girone Level 1</SelectItem>
            <SelectItem value="girone-2">Girone Level 2</SelectItem>
            <SelectItem value="girone-3">Girone Level 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <RankingsTable rankings={mockRankings} />

      <div className="flex gap-4 flex-wrap text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border-l-4 border-l-green-500 bg-card-border" />
          <span className="text-muted-foreground">Promotion Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border-l-4 border-l-red-500 bg-card-border" />
          <span className="text-muted-foreground">Relegation Zone</span>
        </div>
      </div>
    </div>
  );
}
