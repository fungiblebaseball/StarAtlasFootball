import { Card } from "@/components/ui/card";

interface FormationSelectorProps {
  selected?: string;
  onSelect?: (formation: string) => void;
}

const formations = [
  { id: "442", name: "4-4-2", bonus: "+20% Defense" },
  { id: "433", name: "4-3-3", bonus: "+15% Counter" },
  { id: "343", name: "3-4-3", bonus: "+10% Attack" }
];

export default function FormationSelector({ selected = "442", onSelect }: FormationSelectorProps) {
  return (
    <div className="flex gap-4 flex-wrap">
      {formations.map((formation) => (
        <Card
          key={formation.id}
          className={`p-4 cursor-pointer hover-elevate active-elevate-2 transition-all ${
            selected === formation.id ? 'ring-2 ring-primary shadow-md' : ''
          }`}
          onClick={() => onSelect?.(formation.id)}
          data-testid={`card-formation-${formation.id}`}
        >
          <div className="w-28 h-40 flex flex-col items-center justify-center gap-3">
            <div className="relative w-full h-24 bg-green-600/20 dark:bg-green-600/10 rounded-md border border-green-600/30">
              {formation.id === "442" && (
                <>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute bottom-8 left-1/4 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute bottom-8 right-1/4 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-1/2 left-1/4 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-1/2 right-1/4 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-1/2 left-2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-1/2 right-2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-8 left-1/4 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-8 right-1/4 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-8 left-2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-8 right-2 h-2 w-2 rounded-full bg-primary" />
                </>
              )}
              {formation.id === "433" && (
                <>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute bottom-8 left-1/4 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute bottom-8 right-1/4 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-1/2 left-1/3 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-1/2 right-1/3 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-6 left-2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-6 right-2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-10 left-1/4 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-10 right-1/4 h-2 w-2 rounded-full bg-primary" />
                </>
              )}
              {formation.id === "343" && (
                <>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute bottom-8 left-1/3 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute bottom-8 right-1/3 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-1/2 left-1/4 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-1/2 right-1/4 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-1/2 left-2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-1/2 right-2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-6 left-2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-6 right-2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute top-10 left-1/3 h-2 w-2 rounded-full bg-primary" />
                </>
              )}
            </div>
            <div className="text-center">
              <div className="font-heading font-semibold text-lg" data-testid={`text-formation-${formation.id}`}>
                {formation.name}
              </div>
              <div className="text-xs text-muted-foreground" data-testid={`text-bonus-${formation.id}`}>
                {formation.bonus}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
