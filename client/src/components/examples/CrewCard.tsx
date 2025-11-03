import CrewCard from '../CrewCard';

export default function CrewCardExample() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
      <CrewCard
        dasID="crew1"
        name="Nova Striker"
        image="https://images.unsplash.com/photo-1534126511673-b6899657816a?w=400&h=600&fit=crop"
        rarity="Legendary"
        position="FWD"
        number={9}
        stats={{ defense: 45, attack: 95, stamina: 78 }}
        isStarting
        onSelect={() => console.log('Selected Nova Striker')}
      />
      <CrewCard
        dasID="crew2"
        name="Cosmic Guardian"
        image="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop"
        rarity="Epic"
        position="DEF"
        number={4}
        stats={{ defense: 92, attack: 58, stamina: 85 }}
        onSelect={() => console.log('Selected Cosmic Guardian')}
      />
      <CrewCard
        dasID="crew3"
        name="Stellar Playmaker"
        image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop"
        rarity="Rare"
        position="MID"
        stats={{ defense: 68, attack: 75, stamina: 88 }}
        onSelect={() => console.log('Selected Stellar Playmaker')}
      />
      <CrewCard
        dasID="crew4"
        name="Galaxy Keeper"
        image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop"
        rarity="Epic"
        position="GK"
        number={1}
        stats={{ defense: 88, attack: 35, stamina: 82 }}
        isStarting
        onSelect={() => console.log('Selected Galaxy Keeper')}
      />
    </div>
  );
}
