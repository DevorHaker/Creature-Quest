import { useState } from "react";
import { useListPlayerPokemon, useSetPlayerParty } from "@workspace/api-client-react";
import { PokemonSprite } from "@/components/pokemon-sprite";
import { getTypeColor, getTypeBgClass } from "@/lib/type-colors";
import { Button } from "@/components/ui/button";

export default function Collection() {
  const { data: PokemonResponse, isLoading, refetch } = useListPlayerPokemon();
  const Pokemon = PokemonResponse?.data;
  const setPartyMutation = useSetPlayerParty();
  const [selected, setSelected] = useState<number | null>(null);
  const [tab, setTab] = useState<"all" | "party">("all");

  const displayed = tab === "party" ? Pokemon?.filter((a) => a.isInParty) : Pokemon;
  const selectedPokemon = Pokemon?.find((a) => a.id === selected);

  const partyIds = Pokemon?.filter((a) => a.isInParty).sort((a,b) => (a.partySlot??99)-(b.partySlot??99)).map(a => a.id) || [];

  const handleAddToParty = (id: number) => {
    if (partyIds.length >= 3) return;
    setPartyMutation.mutate({ data: { PokemonIds: [...partyIds, id] } }, { onSuccess: () => refetch() });
  };

  const handleRemoveFromParty = (id: number) => {
    setPartyMutation.mutate({ data: { PokemonIds: partyIds.filter(pid => pid !== id) } }, { onSuccess: () => refetch() });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold border-b border-border pb-4">My Collection</h1>
        <div className="text-muted-foreground">Loading your Pokemon...</div>
      </div>
    );
  }

  if (!Pokemon || Pokemon.length === 0) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold border-b border-border pb-4">My Collection</h1>
        <div className="bg-card border border-card-border rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">🔮</div>
          <h2 className="text-xl font-semibold mb-2">No Pokemon Yet</h2>
          <p className="text-muted-foreground">Head to the World to explore and capture your first Pokemon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h1 className="text-3xl font-bold">My Collection</h1>
        <div className="text-sm text-muted-foreground">{Pokemon.length} Pokemon</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["all", "party"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "all" ? `All (${Pokemon.length})` : `Party (${Pokemon.filter((a) => a.isInParty).length})`}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Grid */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayed?.map((a) => {
            const type1 = a.species?.type1 ?? "";
            const color = getTypeColor(type1);
            const hpPercent = (a.currentHp / a.maxHp) * 100;
            return (
              <button
                key={a.id}
                onClick={() => setSelected(a.id === selected ? null : a.id)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  selected === a.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                {a.isInParty && (
                  <div className="text-xs text-primary font-semibold mb-1">● Party</div>
                )}
                <div className="w-20 h-20 mx-auto mb-3">
                  <PokemonSprite
                    speciesName={a.species?.name ?? "Pokemon"}
                    type={type1}
                    spriteUrl={a.species?.spriteUrl ?? ""}
                  />
                </div>
                <div className="font-bold text-sm truncate">{a.nickname ?? a.species?.name}</div>
                <div className="text-xs text-muted-foreground mb-2">Lv.{a.level}</div>
                <div className="flex justify-center gap-1 mb-2">
                  <div
                    className={`text-[10px] px-1.5 py-0.5 rounded-full inline-block ${getTypeBgClass(type1)} border`}
                  >
                    {type1}
                  </div>
                  {a.species?.type2 && (
                    <div
                      className={`text-[10px] px-1.5 py-0.5 rounded-full inline-block ${getTypeBgClass(a.species.type2)} border`}
                    >
                      {a.species.type2}
                    </div>
                  )}
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${hpPercent}%`,
                      backgroundColor: hpPercent > 50 ? "#22c55e" : hpPercent > 25 ? "#f59e0b" : "#ef4444",
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{a.currentHp}/{a.maxHp} HP</div>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        {selectedPokemon && (
          <div className="w-72 flex-shrink-0">
            <div className="bg-card border border-card-border rounded-2xl p-6 sticky top-4 space-y-4">
              <div className="w-28 h-28 mx-auto">
                <PokemonSprite
                  speciesName={selectedPokemon.species?.name ?? "Pokemon"}
                  type={selectedPokemon.species?.type1 ?? ""}
                  spriteUrl={selectedPokemon.species?.spriteUrl ?? ""}
                />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold">{selectedPokemon.nickname ?? selectedPokemon.species?.name}</h2>
                {selectedPokemon.nickname && (
                  <div className="text-sm text-muted-foreground">{selectedPokemon.species?.name}</div>
                )}
                <div className="flex justify-center gap-2 mt-2 flex-wrap">
                  {[selectedPokemon.species?.type1, selectedPokemon.species?.type2].filter(Boolean).map((t) => (
                    <span
                      key={t}
                      className={`text-xs px-2 py-0.5 rounded-full border ${getTypeBgClass(t!)}`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <StatRow label="Level" value={String(selectedPokemon.level)} />
                <StatRow label="HP" value={`${selectedPokemon.currentHp} / ${selectedPokemon.maxHp}`} />
                <StatRow label="Attack" value={String(selectedPokemon.attack)} />
                <StatRow label="Defense" value={String(selectedPokemon.defense)} />
                <StatRow label="Sp.Atk" value={String(selectedPokemon.specialAttack)} />
                <StatRow label="Sp.Def" value={String(selectedPokemon.specialDefense)} />
                <StatRow label="Speed" value={String(selectedPokemon.speed)} />
                <StatRow label="EXP" value={String(selectedPokemon.experience)} />
              </div>

              <div className="pt-2 border-t border-border">
                {selectedPokemon.isInParty ? (
                  <div className="space-y-2 text-center">
                    <div className="text-xs text-muted-foreground mb-2">Currently in party · Slot {selectedPokemon.partySlot}</div>
                    <Button
                      variant="outline"
                      className="w-full border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => handleRemoveFromParty(selectedPokemon.id)}
                      disabled={setPartyMutation.isPending}
                    >
                      Remove from Party
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 text-center">
                    <div className="text-xs text-muted-foreground mb-2">In storage</div>
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => handleAddToParty(selectedPokemon.id)}
                      disabled={partyIds.length >= 3 || setPartyMutation.isPending}
                    >
                      Add to Party
                    </Button>
                    {partyIds.length >= 3 && (
                      <div className="text-xs text-red-400 mt-1">Party is full (max 3)</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
