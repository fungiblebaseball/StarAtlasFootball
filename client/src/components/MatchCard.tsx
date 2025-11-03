import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface MatchCardProps {
  id: string;
  teamA: {
    name: string;
    logo?: string;
  };
  teamB: {
    name: string;
    logo?: string;
  };
  score?: {
    teamA: number;
    teamB: number;
  };
  date: string;
  status: "Scheduled" | "Live" | "Completed";
  onClick?: () => void;
}

export default function MatchCard({ teamA, teamB, score, date, status, onClick }: MatchCardProps) {
  const statusColors = {
    Scheduled: "bg-muted text-muted-foreground",
    Live: "bg-green-500 text-white animate-pulse",
    Completed: "bg-primary text-primary-foreground"
  };

  return (
    <Card className="p-6 hover-elevate cursor-pointer" onClick={onClick} data-testid="card-match">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span data-testid="text-date">{date}</span>
        </div>
        <Badge className={statusColors[status]} data-testid="badge-status">
          {status}
        </Badge>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-center">
          <div className="h-12 w-12 mx-auto mb-2 rounded-full bg-card-border flex items-center justify-center text-xl font-heading" data-testid="logo-team-a">
            {teamA.logo || teamA.name[0]}
          </div>
          <div className="font-medium text-sm" data-testid="text-team-a">{teamA.name}</div>
        </div>

        <div className="flex items-center gap-3">
          {score ? (
            <>
              <div className="font-mono text-4xl font-bold" data-testid="score-team-a">{score.teamA}</div>
              <div className="text-2xl text-muted-foreground">-</div>
              <div className="font-mono text-4xl font-bold" data-testid="score-team-b">{score.teamB}</div>
            </>
          ) : (
            <div className="text-xl text-muted-foreground">vs</div>
          )}
        </div>

        <div className="flex-1 text-center">
          <div className="h-12 w-12 mx-auto mb-2 rounded-full bg-card-border flex items-center justify-center text-xl font-heading" data-testid="logo-team-b">
            {teamB.logo || teamB.name[0]}
          </div>
          <div className="font-medium text-sm" data-testid="text-team-b">{teamB.name}</div>
        </div>
      </div>
    </Card>
  );
}
