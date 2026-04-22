import { useState } from "react";
import { useListPokemon } from "@workspace/api-client-react";
import { PokemonSprite } from "@/components/pokemon-sprite";
import { getTypeColor } from "@/lib/type-colors";

export default function Pokedex() {
  const { data: Pokemon, isLoading } = useListPokemon();
  const [selected, setSelected] = useState<number | null>(null);
  const [filter, setFilter] = useState("");

  const selectedPokemon = Pokemon?.find((a) => a.id === selected);
  const filtered = Pokemon?.filter(
    (a) =>
      a.name.toLowerCase().includes(filter.toLowerCase()) ||
      a.type1.toLowerCase().includes(filter.toLowerCase()) ||
      a.type2?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h1 className="text-3xl font-bold">Pokedex</h1>
        <div className="text-sm text-muted-foreground">{Pokemon?.length ?? 0} species</div>
      </div>

      <input
        className="w-full bg-background border border-input rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Search by name or type..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <div className="flex gap-6">
        {/* Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="text-muted-foreground">Loading species data...</div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered?.map((a) => {
                const color = getTypeColor(a.type1);
                return (
                  <button
                    key={a.id}
                    onClick={() => setSelected(a.id === selected ? null : a.id)}
                    className={`rounded-xl p-3 flex flex-col items-center gap-2 border-2 transition-all text-left ${
                      selected === a.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <div className="w-16 h-16">
                      <PokemonSprite speciesName={a.name} type={a.type1} spriteUrl={a.spriteUrl} />
                    </div>
                    <div className="text-xs font-bold truncate w-full text-center">{a.name}</div>
                    <div className="flex justify-center gap-1">
                      <div
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ backgroundColor: color + "22", color }}
                      >
                        {a.type1}
                      </div>
                      {a.type2 && (
                        <div
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                          style={{ backgroundColor: getTypeColor(a.type2) + "22", color: getTypeColor(a.type2) }}
                        >
                          {a.type2}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedPokemon && (
          <div className="w-72 flex-shrink-0">
            <div className="bg-card border border-card-border rounded-2xl p-6 sticky top-4 space-y-4">
              <div className="w-28 h-28 mx-auto">
                <PokemonSprite
                  speciesName={selectedPokemon.name}
                  type={selectedPokemon.type1}
                  spriteUrl={selectedPokemon.spriteUrl}
                />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold">{selectedPokemon.name}</h2>
                <div className="flex justify-center gap-2 mt-2">
                  <TypeBadge type={selectedPokemon.type1} />
                  {selectedPokemon.type2 && <TypeBadge type={selectedPokemon.type2} />}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{selectedPokemon.description}</p>
              <div className="space-y-2 text-sm">
                <StatBar label="HP" value={selectedPokemon.baseHp} max={150} />
                <StatBar label="Attack" value={selectedPokemon.baseAttack} max={150} />
                <StatBar label="Defense" value={selectedPokemon.baseDefense} max={150} />
                <StatBar label="Sp.Atk" value={selectedPokemon.baseSpecialAttack} max={150} />
                <StatBar label="Sp.Def" value={selectedPokemon.baseSpecialDefense} max={150} />
                <StatBar label="Speed" value={selectedPokemon.baseSpeed} max={150} />
              </div>
              {selectedPokemon.evolvesIntoId && (
                <div className="text-xs text-muted-foreground text-center bg-muted/40 rounded-lg p-2">
                  Evolves at Lv.{selectedPokemon.evolutionLevel ?? "?"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const color = getTypeColor(type);
  return (
    <span
      className="text-xs px-3 py-1 rounded-full font-semibold"
      style={{ backgroundColor: color + "22", color, border: `1px solid ${color}44` }}
    >
      {type}
    </span>
  );
}

function StatBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 text-muted-foreground text-xs">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full"
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
      <span className="w-6 text-right text-xs font-mono">{value}</span>
    </div>
  );
}
