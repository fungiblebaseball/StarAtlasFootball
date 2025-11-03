import MatchEventLog from '../MatchEventLog';

export default function MatchEventLogExample() {
  const mockEvents = [
    { minute: 5, type: "chance" as const, team: "A" as const, description: "Nova Striker with a shot from outside the box, saved by the keeper" },
    { minute: 12, type: "goal" as const, team: "A" as const, description: "GOAL! Stellar Playmaker scores from a brilliant cross!" },
    { minute: 23, type: "counter" as const, team: "B" as const, description: "Cosmic Raiders launch a dangerous counterattack" },
    { minute: 28, type: "save" as const, team: "B" as const, description: "Incredible save by Galaxy Keeper denies the opposition" },
    { minute: 34, type: "goal" as const, team: "B" as const, description: "GOAL! The visitors equalize with a powerful header" },
    { minute: 56, type: "chance" as const, team: "A" as const, description: "Close! Nova Striker's shot hits the post" },
    { minute: 67, type: "goal" as const, team: "A" as const, description: "GOAL! Nova Striker puts the home team ahead!" },
    { minute: 82, type: "save" as const, team: "A" as const, description: "Galaxy Keeper with another crucial save" },
    { minute: 90, type: "goal" as const, team: "A" as const, description: "GOAL! Game sealed with a late counter-attack finish!" }
  ];

  return <MatchEventLog events={mockEvents} />;
}
