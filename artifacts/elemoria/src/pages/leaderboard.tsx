import { useGetLeaderboard, useGetGameSummary } from "@workspace/api-client-react";

function nameToColor(name: string): string {
  const colors = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function Leaderboard() {
  const { data: leaders, isLoading } = useGetLeaderboard();
  const { data: summary } = useGetGameSummary();

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold border-b border-border pb-4">Global Leaderboard</h1>

      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryStat label="Total Trainers" value={String(summary.totalPlayers)} icon="👥" />
          <SummaryStat label="Pokemon Caught" value={String(summary.totalPokemonCaptured)} icon="🔮" />
          <SummaryStat label="Battles Fought" value={String(summary.totalBattlesFought)} icon="⚔️" />
          <SummaryStat label="Species Known" value={String(summary.totalSpeciesDiscovered)} icon="📖" />
        </div>
      )}

      <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
          <div className="col-span-1">Rank</div>
          <div className="col-span-5">Trainer</div>
          <div className="col-span-2 text-right">Level</div>
          <div className="col-span-2 text-right">Wins</div>
          <div className="col-span-2 text-right">Pokemon</div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading rankings...</div>
        ) : !leaders || leaders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No trainers yet — be the first to claim the top spot!
          </div>
        ) : (
          <div>
            {leaders.map((l, i) => {
              const color = nameToColor(l.playerName);
              return (
                <div
                  key={i}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-border/50 last:border-0 transition-colors hover:bg-muted/20 ${
                    i === 0 ? "bg-yellow-500/5" : i === 1 ? "bg-slate-400/5" : i === 2 ? "bg-amber-700/5" : ""
                  }`}
                >
                  <div className="col-span-1 font-bold text-lg">
                    {i < 3 ? medals[i] : <span className="text-muted-foreground text-sm">#{l.rank}</span>}
                  </div>
                  <div className="col-span-5 flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: color + "33", color, border: `1px solid ${color}66` }}
                    >
                      {l.playerName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold">{l.playerName}</div>
                      {l.badges.length > 0 && (
                        <div className="text-xs text-muted-foreground">{l.badges.length} badge{l.badges.length !== 1 ? "s" : ""}</div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 text-right font-medium self-center">Lv.{l.level}</div>
                  <div className="col-span-2 text-right self-center">
                    <span className="font-semibold text-green-400">{l.battlesWon}</span>
                  </div>
                  <div className="col-span-2 text-right self-center">
                    <span className="font-semibold text-primary">{l.totalPokemonCaptured}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryStat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
