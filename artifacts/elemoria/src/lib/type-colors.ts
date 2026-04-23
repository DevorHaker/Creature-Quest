export function getTypeColor(type: string): string {
  switch (type?.toLowerCase()) {
    case "normal": return "#9ca3af";
    case "fire": return "#f97316";
    case "water": return "#3b82f6";
    case "grass":
    case "nature": return "#22c55e";
    case "electric": return "#facc15";
    case "ice": return "#22d3ee";
    case "fighting": return "#ef4444";
    case "poison": return "#a855f7";
    case "ground": return "#a16207";
    case "flying": return "#7dd3fc";
    case "psychic": return "#c084fc";
    case "bug": return "#84cc16";
    case "rock": return "#78350f";
    case "ghost": return "#6366f1";
    case "dragon": return "#4f46e5";
    case "steel": return "#94a3b8";
    case "dark": return "#1e1b4b";
    case "fairy": return "#f472b6";
    default: return "#6366f1";
  }
}

export function getTypeBgClass(type: string): string {
  switch (type?.toLowerCase()) {
    case "normal": return "bg-gray-400/20 text-gray-400 border-gray-400/30";
    case "fire": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "water": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "grass":
    case "nature": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "electric": return "bg-yellow-400/20 text-yellow-400 border-yellow-400/30";
    case "ice": return "bg-cyan-400/20 text-cyan-400 border-cyan-400/30";
    case "fighting": return "bg-red-500/20 text-red-500 border-red-500/30";
    case "poison": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "ground": return "bg-amber-700/20 text-amber-600 border-amber-700/30";
    case "flying": return "bg-sky-400/20 text-sky-400 border-sky-400/30";
    case "psychic": return "bg-violet-500/20 text-violet-400 border-violet-500/30";
    case "bug": return "bg-lime-500/20 text-lime-400 border-lime-500/30";
    case "rock": return "bg-amber-900/20 text-amber-800 border-amber-900/30";
    case "ghost": return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
    case "dragon": return "bg-indigo-700/20 text-indigo-600 border-indigo-700/30";
    case "steel": return "bg-slate-400/20 text-slate-400 border-slate-400/30";
    case "dark": return "bg-slate-900/40 text-slate-300 border-slate-800/30";
    case "fairy": return "bg-pink-400/20 text-pink-400 border-pink-400/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}
