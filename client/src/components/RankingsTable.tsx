import { Card } from "@/components/ui/card";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";

interface TeamRanking {
  position: number;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  isUserTeam?: boolean;
}

interface RankingsTableProps {
  rankings: TeamRanking[];
}

export default function RankingsTable({ rankings }: RankingsTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 sticky top-0">
            <tr className="text-left text-sm">
              <th className="px-4 py-3 font-semibold">Pos</th>
              <th className="px-4 py-3 font-semibold">Team</th>
              <th className="px-4 py-3 font-semibold text-center">P</th>
              <th className="px-4 py-3 font-semibold text-center">W</th>
              <th className="px-4 py-3 font-semibold text-center">D</th>
              <th className="px-4 py-3 font-semibold text-center">L</th>
              <th className="px-4 py-3 font-semibold text-center">GF</th>
              <th className="px-4 py-3 font-semibold text-center">GA</th>
              <th className="px-4 py-3 font-semibold text-center">GD</th>
              <th className="px-4 py-3 font-semibold text-center">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((team, index) => (
              <tr 
                key={team.teamName}
                className={`border-t border-border hover-elevate ${
                  team.isUserTeam ? 'bg-primary/5 font-semibold' : ''
                } ${
                  index < 3 ? 'border-l-4 border-l-green-500' : 
                  index >= rankings.length - 3 ? 'border-l-4 border-l-red-500' : ''
                }`}
                data-testid={`row-team-${index + 1}`}
              >
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center gap-2">
                    {team.position <= 3 && (
                      <Trophy className={`h-4 w-4 ${
                        team.position === 1 ? 'text-yellow-500' :
                        team.position === 2 ? 'text-gray-400' :
                        'text-amber-600'
                      }`} />
                    )}
                    <span className="font-mono" data-testid={`text-position-${index + 1}`}>{team.position}</span>
                  </div>
                </td>
                <td className="px-4 py-3" data-testid={`text-team-${index + 1}`}>{team.teamName}</td>
                <td className="px-4 py-3 text-center font-mono" data-testid={`text-played-${index + 1}`}>{team.played}</td>
                <td className="px-4 py-3 text-center font-mono" data-testid={`text-won-${index + 1}`}>{team.won}</td>
                <td className="px-4 py-3 text-center font-mono" data-testid={`text-drawn-${index + 1}`}>{team.drawn}</td>
                <td className="px-4 py-3 text-center font-mono" data-testid={`text-lost-${index + 1}`}>{team.lost}</td>
                <td className="px-4 py-3 text-center font-mono" data-testid={`text-gf-${index + 1}`}>{team.goalsFor}</td>
                <td className="px-4 py-3 text-center font-mono" data-testid={`text-ga-${index + 1}`}>{team.goalsAgainst}</td>
                <td className="px-4 py-3 text-center font-mono" data-testid={`text-gd-${index + 1}`}>
                  {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                </td>
                <td className="px-4 py-3 text-center font-mono font-bold" data-testid={`text-points-${index + 1}`}>
                  {team.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
