import { useListRegions, useStartBattle } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useGameStore } from "@/hooks/use-game-store";

export default function World() {
  const { data: regionsResponse } = useListRegions();
  const regions = regionsResponse?.data;
  const startBattle = useStartBattle();
  const [, setLocation] = useLocation();
  const setActiveBattleId = useGameStore(s => s.setActiveBattleId);

  const onExplore = (regionId: number) => {
    startBattle.mutate({ data: { battleType: "wild", regionId } }, {
      onSuccess: (resp) => {
        setActiveBattleId(resp.data.id);
        setLocation("/battle");
      },
      onError: (error: any) => {
        const errorMsg =
          error?.data?.error ||
          error?.data?.message ||
          error?.message ||
          "Failed to start battle.";
        window.alert(errorMsg);
      }
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold border-b border-border pb-4">World Map</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {regions?.map(r => (
          <div key={r.id} className="bg-card border border-card-border rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity" style={{ backgroundImage: `url(${r.imageUrl})`}} />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">{r.name}</h2>
              <p className="text-muted-foreground mb-4">{r.description}</p>
              <div className="text-sm mb-4">Levels: {r.minLevel} - {r.maxLevel}</div>
              <Button onClick={() => onExplore(r.id)} disabled={startBattle.isPending}>
                Explore Region
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
