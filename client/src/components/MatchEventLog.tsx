import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Shield, Zap, Clock } from "lucide-react";

interface MatchEvent {
  minute: number;
  type: "goal" | "save" | "counter" | "chance";
  team: "A" | "B";
  description: string;
}

interface MatchEventLogProps {
  events: MatchEvent[];
}

export default function MatchEventLog({ events }: MatchEventLogProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "goal": return <Target className="h-4 w-4" />;
      case "save": return <Shield className="h-4 w-4" />;
      case "counter": return <Zap className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "goal": return "bg-green-500 text-white";
      case "save": return "bg-blue-500 text-white";
      case "counter": return "bg-yellow-500 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="p-6">
      <h3 className="font-heading font-semibold text-xl mb-6">Match Events</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {events.map((event, index) => (
          <div 
            key={index} 
            className={`flex items-start gap-3 p-3 rounded-md ${
              event.team === "A" ? "bg-card-border/50" : "bg-muted/30"
            }`}
            data-testid={`event-${index}`}
          >
            <Badge className={`${getEventColor(event.type)} shrink-0`} data-testid={`badge-minute-${index}`}>
              {getEventIcon(event.type)}
              <span className="ml-1 font-mono">{event.minute}'</span>
            </Badge>
            <p className="text-sm flex-1" data-testid={`text-description-${index}`}>{event.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
