import { useState } from "react";
import { useGetBattle, usePerformBattleAction, getGetBattleQueryKey } from "@workspace/api-client-react";
import { useGameStore } from "@/hooks/use-game-store";
import { PokemonSprite } from "@/components/pokemon-sprite";
import { getTypeBgClass } from "@/lib/type-colors";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Battle() {
  const activeBattleId = useGameStore((s) => s.activeBattleId);
  const [, setLocation] = useLocation();
  const { data: battleResponse, refetch } = useGetBattle(activeBattleId ?? 0, {
    query: { 
      queryKey: getGetBattleQueryKey(activeBattleId ?? 0),
      enabled: !!activeBattleId, 
      refetchInterval: false 
    },
  });
  const battle = battleResponse?.data;
  const actionMutation = usePerformBattleAction();
  const [showPartyView, setShowPartyView] = useState(false);

  if (!activeBattleId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
        <div className="text-4xl">⚔️</div>
        <p>No active battle. Head to the World to start one!</p>
        <Button onClick={() => setLocation("/world")}>Go to World</Button>
      </div>
    );
  }

  if (!battle)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading battle...
      </div>
    );

  const doAction = (moveId: number) => {
    actionMutation.mutate(
      { battleId: activeBattleId, data: { action: "attack", moveId } },
      { onSuccess: () => { refetch(); } }
    );
  };

  const doCapture = () => {
    actionMutation.mutate(
      { battleId: activeBattleId, data: { action: "capture" } },
      { onSuccess: () => { refetch(); } }
    );
  };

  const doSwitch = (switchToPokemonId: number) => {
    actionMutation.mutate(
      { battleId: activeBattleId, data: { action: "switch", switchToPokemonId } },
      { onSuccess: () => { setShowPartyView(false); refetch(); } }
    );
  };

  const flee = () => {
    actionMutation.mutate(
      { battleId: activeBattleId, data: { action: "flee" } },
      {
        onSuccess: () => {
          useGameStore.getState().setActiveBattleId(null);
          setLocation("/world");
        },
      }
    );
  };

  const playerHpPct = (battle.playerPokemon.currentHp / battle.playerPokemon.maxHp) * 100;
  const opponentHpPct = (battle.opponentPokemon.currentHp / battle.opponentPokemon.maxHp) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-card border border-border p-4 rounded-xl">
        <div>
          <h2 className="text-2xl font-bold">
            {battle.type === "wild" ? "Wild Battle" : "Trainer Battle"}
          </h2>
          <div className="text-sm text-muted-foreground">Turn {battle.turn}</div>
        </div>
        <Button variant="outline" onClick={flee} disabled={actionMutation.isPending}>
          Flee
        </Button>
      </div>

      {/* Battle arena */}
      <div className="relative h-72 bg-card/50 border border-border rounded-2xl overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 to-transparent" />

        {/* Opponent (top-right) */}
        <div className="absolute top-4 right-8 flex flex-col items-end gap-2">
          <div className="bg-card/80 backdrop-blur border border-border rounded-xl px-4 py-2">
            <div className="flex items-center gap-3">
              <div>
                <div className="font-bold text-sm">{battle.opponentPokemon.name}</div>
                <div className="flex items-center justify-end gap-1 mt-1 font-semibold">
                  <div className={`text-[10px] px-1.5 py-0.5 rounded-full ${getTypeBgClass(battle.opponentPokemon.type1)}`}>
                    {battle.opponentPokemon.type1}
                  </div>
                  {battle.opponentPokemon.type2 && (
                    <div className={`text-[10px] px-1.5 py-0.5 rounded-full ${getTypeBgClass(battle.opponentPokemon.type2)}`}>
                      {battle.opponentPokemon.type2}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground ml-1">Lv.{battle.opponentPokemon.level}</div>
                </div>
              </div>
              <div className="w-24">
                <div className="text-xs text-muted-foreground mb-1 text-right">
                  {battle.opponentPokemon.currentHp}/{battle.opponentPokemon.maxHp}
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${opponentHpPct}%`,
                      backgroundColor: opponentHpPct > 50 ? "#22c55e" : opponentHpPct > 25 ? "#f59e0b" : "#ef4444",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="w-24 h-24" style={{ transform: "scaleX(-1)" }}>
            <PokemonSprite
              speciesName={battle.opponentPokemon.name}
              type={battle.opponentPokemon.type1}
              spriteUrl={battle.opponentPokemon.spriteUrl}
            />
          </div>
        </div>

        {/* Player (bottom-left) */}
        <div className="absolute bottom-4 left-8 flex flex-col items-start gap-2">
          <div className="w-24 h-24">
            <PokemonSprite
              speciesName={battle.playerPokemon.name}
              type={battle.playerPokemon.type1}
              spriteUrl={battle.playerPokemon.backSpriteUrl ?? battle.playerPokemon.spriteUrl}
              isBack
            />
          </div>
          <div className="bg-card/80 backdrop-blur border border-border rounded-xl px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="w-24">
                <div className="text-xs text-muted-foreground mb-1">
                  {battle.playerPokemon.currentHp}/{battle.playerPokemon.maxHp}
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${playerHpPct}%`,
                      backgroundColor: playerHpPct > 50 ? "#22c55e" : playerHpPct > 25 ? "#f59e0b" : "#ef4444",
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="font-bold text-sm">{battle.playerPokemon.name}</div>
                <div className="flex items-center gap-1 mt-1 font-semibold">
                  <div className={`text-[10px] px-1.5 py-0.5 rounded-full ${getTypeBgClass(battle.playerPokemon.type1)}`}>
                    {battle.playerPokemon.type1}
                  </div>
                  {battle.playerPokemon.type2 && (
                    <div className={`text-[10px] px-1.5 py-0.5 rounded-full ${getTypeBgClass(battle.playerPokemon.type2)}`}>
                      {battle.playerPokemon.type2}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground ml-1">Lv.{battle.playerPokemon.level}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions or result */}
      {battle.status === "active" ? (
        battle.requiresSwitch ? (
          <div>
            <div className="text-xs text-red-400 mb-2 font-semibold uppercase tracking-wider text-center">
              {battle.playerPokemon.currentHp <= 0 ? `${battle.playerPokemon.name} fainted! Choose next Pokemon.` : "Choose next Pokemon."}
            </div>
            <PartySelect party={battle.playerParty} onSelect={doSwitch} disabled={actionMutation.isPending} />
          </div>
        ) : showPartyView ? (
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Switch Pokemon</div>
              <Button variant="ghost" size="sm" onClick={() => setShowPartyView(false)}>Back</Button>
            </div>
            <PartySelect party={battle.playerParty} onSelect={doSwitch} disabled={actionMutation.isPending} />
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Choose an action
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {battle.playerPokemon.moves.map((m) => (
                <Button
                  key={m.id}
                  size="lg"
                  className="h-16 flex-col gap-1"
                  onClick={() => doAction(m.id)}
                  disabled={actionMutation.isPending}
                >
                  <span className="font-bold">{m.name}</span>
                  <span className="text-xs opacity-70">{m.type} · {m.power} PWR</span>
                </Button>
              ))}
              {battle.playerParty && battle.playerParty.length > 0 && (
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-16"
                  onClick={() => setShowPartyView(true)}
                  disabled={actionMutation.isPending}
                >
                  🔄 Switch
                </Button>
              )}
              {battle.canCapture && (
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16"
                  onClick={doCapture}
                  disabled={actionMutation.isPending}
                >
                  🔮 Capture
                </Button>
              )}
            </div>
          </div>
        )
      ) : (
        <div
          className={`p-6 rounded-2xl text-center border ${
            battle.result === "won" || battle.result === "captured"
              ? "bg-green-500/10 border-green-500/30"
              : battle.result === "fled"
              ? "bg-yellow-500/10 border-yellow-500/30"
              : "bg-red-500/10 border-red-500/30"
          }`}
        >
          <div className="text-3xl mb-2">
            {battle.result === "won" ? "🏆" : battle.result === "captured" ? "🔮" : battle.result === "fled" ? "💨" : "💀"}
          </div>
          <div className="text-xl font-bold mb-1">
            {battle.result === "won"
              ? "Victory!"
              : battle.result === "captured"
              ? "Pokemon Captured!"
              : battle.result === "fled"
              ? "Got away safely"
              : "Defeated..."}
          </div>
          {(battle.expGained || battle.currencyGained) && (
            <div className="text-sm text-muted-foreground mb-4">
              +{battle.expGained} EXP · +{battle.currencyGained} ⬡
            </div>
          )}
          <Button
            onClick={() => {
              useGameStore.getState().setActiveBattleId(null);
              setLocation("/world");
            }}
          >
            Return to World
          </Button>
        </div>
      )}

      {/* Battle log */}
      <div className="bg-black/50 border border-border rounded-xl p-4 h-40 overflow-y-auto font-mono text-sm space-y-1">
        {[...battle.log].reverse().map((l, i) => (
          <div key={i} className={`${i === 0 ? "text-foreground" : "text-muted-foreground"}`}>
            {">"} {l}
          </div>
        ))}
      </div>
    </div>
  );
}

function PartySelect({ party, onSelect, disabled }: { party: any[], onSelect: (id: number) => void, disabled?: boolean }) {
  if (!party || party.length === 0) {
    return <div className="text-center text-muted-foreground py-4">No other running Pokemon.</div>;
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {party.map((p) => {
        const isFainted = p.currentHp <= 0;
        const hpPct = (p.currentHp / p.maxHp) * 100;
        return (
          <Button
            key={p.playerPokemonId}
            variant="outline"
            className={`h-auto py-3 justify-start gap-4 ${isFainted ? "opacity-50 grayscale" : ""}`}
            disabled={disabled || isFainted}
            onClick={() => onSelect(p.playerPokemonId)}
          >
            <div className="w-12 h-12 flex-shrink-0">
               <PokemonSprite speciesName={p.name} type={p.type1} spriteUrl={p.spriteUrl} />
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold">{p.name} <span className="text-xs text-muted-foreground font-normal overflow-hidden text-ellipsis ml-1">Lv.{p.level}</span></div>
              <div className="mt-1 h-1.5 bg-muted rounded-full w-full max-w-[120px]">
                <div className="h-full rounded-full" style={{ width: `${hpPct}%`, backgroundColor: hpPct > 50 ? "#22c55e" : hpPct > 25 ? "#f59e0b" : "#ef4444" }} />
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{p.currentHp} / {p.maxHp}</div>
            </div>
          </Button>
        );
      })}
    </div>
  );
}
