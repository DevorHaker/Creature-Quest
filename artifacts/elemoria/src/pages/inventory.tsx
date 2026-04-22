import { useGetInventory } from "@workspace/api-client-react";

const ITEM_ICONS: Record<string, string> = {
  orb: "🔮",
  potion: "🧪",
  elixir: "💊",
  bait: "🍖",
  repel: "🛡️",
  vial: "🧪",
  crystal: "💎",
  essence: "✨",
};

function getItemIcon(name: string) {
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(ITEM_ICONS)) {
    if (lower.includes(k)) return v;
  }
  return "📦";
}

export default function Inventory() {
  const { data, isLoading } = useGetInventory();
  const items = data?.items ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h1 className="text-3xl font-bold">Inventory</h1>
        <div className="text-sm text-muted-foreground">
          {data ? `${data.usedSlots} / ${data.totalSlots} slots` : ""}
        </div>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading inventory...</div>
      ) : items.length === 0 ? (
        <div className="bg-card border border-card-border rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">🎒</div>
          <h2 className="text-xl font-semibold mb-2">Empty Bag</h2>
          <p className="text-muted-foreground">Win battles and explore regions to collect items!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-card border border-card-border rounded-xl p-5 flex gap-4 items-start">
              <div className="text-4xl">{getItemIcon(item.name)}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold">{item.name}</div>
                <div className="text-xs text-muted-foreground mb-3">{item.description}</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">×{item.quantity}</span>
                  <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground capitalize">
                    {item.effect}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
