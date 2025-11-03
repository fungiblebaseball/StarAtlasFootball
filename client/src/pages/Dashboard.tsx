import StatCard from "@/components/StatCard";
import MatchCard from "@/components/MatchCard";
import { Trophy, Target, TrendingUp, Coins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Dashboard() {
  // TODO: remove mock functionality - Replace with real data from backend
  const mockMatches = [
    {
      id: "1",
      teamA: { name: "Your Team" },
      teamB: { name: "Cosmic Raiders" },
      score: { teamA: 3, teamB: 1 },
      date: "Nov 2, 2025",
      status: "Completed" as const
    },
    {
      id: "2",
      teamA: { name: "Your Team" },
      teamB: { name: "Nebula United" },
      date: "Nov 3, 2025",
      status: "Live" as const
    },
    {
      id: "3",
      teamA: { name: "Void Strikers" },
      teamB: { name: "Your Team" },
      date: "Nov 5, 2025",
      status: "Scheduled" as const
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-bold text-4xl mb-2" data-testid="text-page-title">Dashboard</h1>
        <p className="text-muted-foreground" data-testid="text-page-subtitle">
          Welcome back! Here's your team overview
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={Trophy} 
          value="23" 
          label="Wins" 
          trend={{ value: "+12%", positive: true }} 
        />
        <StatCard 
          icon={Target} 
          value="67" 
          label="Goals Scored" 
          trend={{ value: "+8%", positive: true }} 
        />
        <StatCard 
          icon={TrendingUp} 
          value="3rd" 
          label="Ranking" 
          trend={{ value: "↑2", positive: true }} 
        />
        <StatCard 
          icon={Coins} 
          value="1,250" 
          label="ATLAS Balance" 
        />
      </div>

      <Card className="p-6">
        <h2 className="font-heading font-semibold text-2xl mb-4" data-testid="text-formation-title">
          Current Formation
        </h2>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-3xl font-heading font-bold mb-1" data-testid="text-current-formation">4-4-2</div>
            <p className="text-sm text-muted-foreground" data-testid="text-formation-bonus">+20% Defensive Strength</p>
          </div>
          <Link href="/roster">
            <Button data-testid="button-edit-team">Edit Team</Button>
          </Link>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-2xl" data-testid="text-matches-title">Recent Matches</h2>
          <Link href="/matches">
            <Button variant="outline" size="sm" data-testid="button-view-all">View All</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockMatches.map((match) => (
            <MatchCard 
              key={match.id}
              {...match}
              onClick={() => console.log('View match', match.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
