import MatchCard from '../MatchCard';

export default function MatchCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
      <MatchCard
        id="1"
        teamA={{ name: "Stellar Warriors" }}
        teamB={{ name: "Cosmic Raiders" }}
        score={{ teamA: 3, teamB: 1 }}
        date="Nov 2, 2025"
        status="Completed"
        onClick={() => console.log('View match details')}
      />
      <MatchCard
        id="2"
        teamA={{ name: "Galaxy Knights" }}
        teamB={{ name: "Nebula United" }}
        date="Nov 3, 2025"
        status="Live"
        onClick={() => console.log('View live match')}
      />
      <MatchCard
        id="3"
        teamA={{ name: "Stellar Warriors" }}
        teamB={{ name: "Void Strikers" }}
        date="Nov 5, 2025"
        status="Scheduled"
        onClick={() => console.log('Preview match')}
      />
    </div>
  );
}
