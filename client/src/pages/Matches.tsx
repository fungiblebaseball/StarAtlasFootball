import { useState } from "react";
import MatchCard from "@/components/MatchCard";
import MatchEventLog from "@/components/MatchEventLog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Matches() {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  // TODO: remove mock functionality - Replace with real match data from backend
  const mockMatches = [
    { id: "1", teamA: { name: "Your Team" }, teamB: { name: "Cosmic Raiders" }, score: { teamA: 3, teamB: 1 }, date: "Nov 2, 2025", status: "Completed" as const },
    { id: "2", teamA: { name: "Galaxy Knights" }, teamB: { name: "Nebula United" }, score: { teamA: 2, teamB: 2 }, date: "Nov 2, 2025", status: "Completed" as const },
    { id: "3", teamA: { name: "Your Team" }, teamB: { name: "Void Strikers" }, date: "Nov 5, 2025", status: "Scheduled" as const },
    { id: "4", teamA: { name: "Pulsar FC" }, teamB: { name: "Your Team" }, date: "Nov 8, 2025", status: "Scheduled" as const },
    { id: "5", teamA: { name: "Your Team" }, teamB: { name: "Orion Rovers" }, date: "Nov 12, 2025", status: "Scheduled" as const },
  ];

  const mockEvents = [
    { minute: 12, type: "goal" as const, team: "A" as const, description: "GOAL! Stellar Playmaker scores from a brilliant cross!" },
    { minute: 28, type: "save" as const, team: "B" as const, description: "Incredible save by Galaxy Keeper denies the opposition" },
    { minute: 34, type: "goal" as const, team: "B" as const, description: "GOAL! The visitors equalize with a powerful header" },
    { minute: 67, type: "goal" as const, team: "A" as const, description: "GOAL! Nova Striker puts the home team ahead!" },
    { minute: 90, type: "goal" as const, team: "A" as const, description: "GOAL! Game sealed with a late counter-attack finish!" }
  ];

  const completedMatches = mockMatches.filter(m => m.status === "Completed");
  const upcomingMatches = mockMatches.filter(m => m.status === "Scheduled");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-bold text-4xl mb-2" data-testid="text-page-title">Matches</h1>
        <p className="text-muted-foreground" data-testid="text-page-subtitle">
          View your match schedule and results
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming" data-testid="tab-upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingMatches.map((match) => (
              <MatchCard
                key={match.id}
                {...match}
                onClick={() => setSelectedMatch(match.id)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedMatches.map((match) => (
              <MatchCard
                key={match.id}
                {...match}
                onClick={() => setSelectedMatch(match.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl" data-testid="text-dialog-title">Match Details</DialogTitle>
            <DialogDescription data-testid="text-dialog-desc">
              Review the match events and final score
            </DialogDescription>
          </DialogHeader>
          <MatchEventLog events={mockEvents} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
