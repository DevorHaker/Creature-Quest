import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/hooks/use-game-store";
import { useCreatePlayer, useListPokemon } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetPlayerQueryKey } from "@workspace/api-client-react";

const AVATAR_COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
];

export default function Home() {
  const [, setLocation] = useLocation();
  const playerId = useGameStore((s) => s.playerId);
  const setPlayerId = useGameStore((s) => s.setPlayerId);
  const queryClient = useQueryClient();
  const { data: allPokemonResponse } = useListPokemon();
  const allPokemon = allPokemonResponse?.data;
  const createPlayer = useCreatePlayer();

  const [name, setName] = useState("");
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [starterPokemonId, setStarterPokemonId] = useState<number | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  // Fallback starters when the API/database is unavailable
  // NOTE: names match the migrated DB names (Charmander/Squirtle/Chikorita)
  const FALLBACK_STARTERS = [
    {
      id: 1,
      name: "Charmander",
      description: "A fierce fire creature born from volcanic heat.",
      type1: "Fire",
      type2: null,
      baseHp: 45, baseAttack: 52, baseDefense: 43, baseSpeed: 65,
      baseSpecialAttack: 60, baseSpecialDefense: 50,
      evolutionLevel: 16, evolvesIntoId: null, catchRate: 45,
      spriteUrl: "", backSpriteUrl: "", moveIds: [], rarity: "rare",
    },
    {
      id: 2,
      name: "Squirtle",
      description: "A gentle water spirit from the deep oceans.",
      type1: "Water",
      type2: null,
      baseHp: 44, baseAttack: 48, baseDefense: 65, baseSpeed: 43,
      baseSpecialAttack: 50, baseSpecialDefense: 64,
      evolutionLevel: 16, evolvesIntoId: null, catchRate: 45,
      spriteUrl: "", backSpriteUrl: "", moveIds: [], rarity: "rare",
    },
    {
      id: 3,
      name: "Chikorita",
      description: "A curious nature creature from ancient forests.",
      type1: "Grass",
      type2: null,
      baseHp: 45, baseAttack: 49, baseDefense: 49, baseSpeed: 45,
      baseSpecialAttack: 65, baseSpecialDefense: 65,
      evolutionLevel: 16, evolvesIntoId: null, catchRate: 45,
      spriteUrl: "", backSpriteUrl: "", moveIds: [], rarity: "rare",
    },
  ];

  // Filter using the current DB names (renamed from fantasy names to Pokémon names)
  const STARTER_NAMES = ["Charmander", "Squirtle", "Chikorita"];
  const apiStarters = Array.isArray(allPokemon)
    ? allPokemon.filter((a) => STARTER_NAMES.includes(a.name))
    : [];
  const starters = apiStarters.length > 0 ? apiStarters : FALLBACK_STARTERS;

  const handleStart = () => {
    if (playerId) {
      setLocation("/hub");
      return;
    }
    setShowSetup(true);
  };

  const handleCreatePlayer = () => {
    if (!name.trim() || !starterPokemonId) return;
    createPlayer.mutate(
      {
        data: {
          name: name.trim(),
          avatarColor,
          starterPokemonSpeciesId: starterPokemonId,
        },
      },
      {
        onSuccess: async (resp) => {
          setPlayerId(resp.data.id);
          await queryClient.invalidateQueries({ queryKey: getGetPlayerQueryKey() });
          setLocation("/hub");
        },
        onError: (error: any) => {
          console.error("Creation failed:", error);
          let message = "Failed to start adventure. Please check your connection and try again.";
          
          if (error?.data?.error) {
            message = error.data.error;
          } else if (error?.status) {
            message = `Server Error (${error.status}): ${error.statusText || "Unknown Error"}. This usually means the database is unreachable or misconfigured.`;
          } else if (error?.message) {
            message = `Network Error: ${error.message}. Please check your internet connection.`;
          }
          
          alert(message);
        }
      }
    );
  };

  if (showSetup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background overflow-hidden relative px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(99,102,241,0.15),_transparent_60%)]" />
        <div className="relative z-10 w-full max-w-lg space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Begin Your Journey</h2>
            <p className="text-muted-foreground mt-2">Choose your name, your color, and your first companion.</p>
          </div>

          <div className="bg-card border border-card-border rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground uppercase tracking-wider">Trainer Name</label>
              <input
                className="w-full bg-background border border-input rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">Avatar Color</label>
              <div className="flex gap-3 flex-wrap">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setAvatarColor(c)}
                    className="w-10 h-10 rounded-full border-2 transition-all"
                    style={{
                      backgroundColor: c,
                      borderColor: avatarColor === c ? "white" : "transparent",
                      transform: avatarColor === c ? "scale(1.15)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">Choose Your Starter Pokemon</label>
              {starters.length === 0 ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Loading starters...
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {starters.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStarterPokemonId(s.id)}
                      className={`rounded-xl border-2 p-4 transition-all text-center space-y-2 ${
                        starterPokemonId === s.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <div
                        className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-bold"
                        style={{ backgroundColor: getTypeColor(s.type1) + "33", color: getTypeColor(s.type1) }}
                      >
                        {s.name[0]}
                      </div>
                      <div className="text-sm font-bold">{s.name}</div>
                      <div
                        className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ backgroundColor: getTypeColor(s.type1) + "22", color: getTypeColor(s.type1) }}
                      >
                        {s.type1}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button
            className="w-full h-14 text-lg"
            disabled={!name.trim() || !starterPokemonId || createPlayer.isPending}
            onClick={handleCreatePlayer}
          >
            {createPlayer.isPending ? "Creating..." : "Begin Adventure"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.25),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-[radial-gradient(ellipse_80%_50%_at_50%_110%,rgba(139,92,246,0.15),transparent)]" />
      </div>

      <div className="relative z-10 text-center space-y-10 max-w-lg mx-auto px-6">
        <div className="space-y-3">
          <div className="text-primary/60 text-sm font-semibold tracking-[0.4em] uppercase">A New Legend Begins</div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40">
            Elemoria
          </h1>
          <p className="text-xl md:text-2xl text-primary font-semibold tracking-[0.2em] uppercase">
            Rise of the Pokemon
          </p>
        </div>

        <p className="text-muted-foreground text-base leading-relaxed">
          Enter a living fantasy world. Capture elemental creatures called Pokemon, forge unbreakable bonds, and master the ancient art of elemental battle.
        </p>

        <div className="flex flex-col gap-3 items-center">
          <Button
            size="lg"
            onClick={handleStart}
            className="text-lg px-16 py-6 h-auto shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] hover:-translate-y-1 transition-all duration-200"
          >
            {playerId ? "Continue Adventure" : "Start Your Journey"}
          </Button>
          {playerId && (
            <button
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
              onClick={() => {
                setPlayerId(null);
                useGameStore.getState().setActiveBattleId(null);
                setShowSetup(true);
              }}
            >
              New Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    Fire: "#f97316",
    Water: "#3b82f6",
    Grass: "#22c55e",
    Earth: "#a16207",
    Air: "#38bdf8",
    Lightning: "#eab308",
    Shadow: "#4f46e5",
    Crystal: "#ec4899",
    Arcane: "#d946ef",
    Void: "#111827",
  };
  return colors[type] || "#ffffff";
}
