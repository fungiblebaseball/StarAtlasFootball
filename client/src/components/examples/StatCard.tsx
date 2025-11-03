import StatCard from '../StatCard';
import { Trophy, Target, TrendingUp, Coins } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard icon={Trophy} value="23" label="Wins" trend={{ value: "+12%", positive: true }} />
      <StatCard icon={Target} value="67" label="Goals Scored" trend={{ value: "+8%", positive: true }} />
      <StatCard icon={TrendingUp} value="3rd" label="Ranking" trend={{ value: "↑2", positive: true }} />
      <StatCard icon={Coins} value="1,250" label="ATLAS Balance" />
    </div>
  );
}
