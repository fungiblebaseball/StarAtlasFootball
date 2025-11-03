import PerkCard from '../PerkCard';

export default function PerkCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
      <PerkCard
        name="Counter Strike"
        description="+15% chance for successful counterattacks"
        price={50}
        icon="⚡"
        onPurchase={() => console.log('Purchase Counter Strike')}
      />
      <PerkCard
        name="Iron Defense"
        description="+20% defensive strength and blocking"
        price={75}
        icon="🛡️"
        owned
        onPurchase={() => console.log('Already owned')}
      />
      <PerkCard
        name="Goal Machine"
        description="+10% finishing accuracy in the box"
        price={100}
        icon="⚽"
        onPurchase={() => console.log('Purchase Goal Machine')}
      />
    </div>
  );
}
