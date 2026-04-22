import { useGetPlayer, useListPlayerPokemon, useHealParty } from "@workspace/api-client-react";
import { useGameStore } from "@/hooks/use-game-store";
import { useTypeColor } from "@/hooks/use-type-color";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Hub() {
  const [, setLocation] = useLocation();
  const { data: playerResponse } = useGetPlayer();
  const player = playerResponse?.data;
  const { data: PokemonResponse, refetch: refetchPokemon } = useListPlayerPokemon();
  const Pokemon = PokemonResponse?.data;
  const healMutation = useHealParty();

  const handleHeal = () => {
    healMutation.mutate(undefined as any, {
      onSuccess: () => {
        window.alert("Your Pokemon have been fully healed!");
        refetchPokemon();
      }
    });
  };

  const partyPokemon = Pokemon?.filter((a) => a.isInParty) ?? [];
  const expPercent = player ? ((player.experience % 200) / 200) * 100 : 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold border-b border-border pb-4">Player Hub</h1>

      {player ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player stats */}
          <div className="bg-card border border-card-border p-6 rounded-xl">
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black"
                style={{ backgroundColor: player.avatarColor + "33", color: player.avatarColor, border: `2px solid ${player.avatarColor}` }}
              >
                {player.name[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold">{player.name}</h2>
                <div className="text-sm text-primary">Pokemon Master · Lv.{player.level}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-medium">{player.experience % 200} / 200 XP</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${expPercent}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between bg-muted/40 rounded-lg px-3 py-2">
                  <span className="text-muted-foreground">Currency</span>
                  <span className="font-semibold text-amber-400">⬡ {player.currency}</span>
                </div>
                <div className="flex justify-between bg-muted/40 rounded-lg px-3 py-2">
                  <span className="text-muted-foreground">Pokemon</span>
                  <span className="font-semibold">{player.totalPokemonCaptured + (Pokemon?.length ?? 0)}</span>
                </div>
                <div className="flex justify-between bg-muted/40 rounded-lg px-3 py-2">
                  <span className="text-muted-foreground">Battles</span>
                  <span className="font-semibold">{player.totalBattles}</span>
                </div>
                <div className="flex justify-between bg-muted/40 rounded-lg px-3 py-2">
                  <span className="text-muted-foreground">Wins</span>
                  <span className="font-semibold text-green-400">{player.battlesWon}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-card border border-card-border p-6 rounded-xl space-y-3">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <Button className="w-full justify-start gap-3" onClick={() => setLocation("/world")}>
              <span>🗺️</span> Explore World
            </Button>
            <Button 
              variant="default" 
              className="w-full justify-start gap-3 bg-green-600 hover:bg-green-700 text-white" 
              onClick={handleHeal}
              disabled={healMutation.isPending}
            >
              <span>🏥</span> Heal Pokemon (Free)
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3" onClick={() => setLocation("/collection")}>
              <span>📖</span> My Collection
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3" onClick={() => setLocation("/pokedex")}>
              <span>🔬</span> Pokedex
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3" onClick={() => setLocation("/inventory")}>
              <span>🎒</span> Inventory
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3" onClick={() => setLocation("/leaderboard")}>
              <span>🏆</span> Leaderboard
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-muted-foreground">Loading player data...</div>
      )}

      {/* Party */}
      {partyPokemon.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Party</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {partyPokemon.map((a) => (
              <PartyPokemonCard key={a.id} Pokemon={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PartyPokemonCard({ Pokemon }: { Pokemon: any }) {
  const typeColor = useTypeColor(Pokemon.species?.type1 ?? "");
  const hpPercent = (Pokemon.currentHp / Pokemon.maxHp) * 100;

  return (
    <div className="bg-card border border-card-border rounded-xl p-4 text-center space-y-2">
      <div
        className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-2xl font-bold"
        style={{ backgroundColor: typeColor + "22", color: typeColor }}
      >
        {(Pokemon.nickname ?? Pokemon.species?.name ?? "?")[0]}
      </div>
      <div className="text-sm font-bold truncate">{Pokemon.nickname ?? Pokemon.species?.name}</div>
      <div className="text-xs text-muted-foreground">Lv.{Pokemon.level}</div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${hpPercent}%`,
            backgroundColor: hpPercent > 50 ? "#22c55e" : hpPercent > 25 ? "#f59e0b" : "#ef4444",
          }}
        />
      </div>
      <div className="text-xs text-muted-foreground">{Pokemon.currentHp}/{Pokemon.maxHp}</div>
    </div>
  );
}
