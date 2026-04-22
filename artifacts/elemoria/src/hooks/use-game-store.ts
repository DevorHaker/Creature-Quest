import { create } from "zustand";

interface PlayerState {
  playerId: number | null;
  setPlayerId: (id: number | null) => void;
  activeBattleId: number | null;
  setActiveBattleId: (id: number | null) => void;
}

// We'll use local storage directly in the store init
const getInitialPlayerId = () => {
  const stored = localStorage.getItem("elemoria_player_id");
  return stored ? parseInt(stored, 10) : null;
};

const getInitialBattleId = () => {
  const stored = localStorage.getItem("elemoria_battle_id");
  return stored ? parseInt(stored, 10) : null;
};

export const useGameStore = create<PlayerState>((set) => ({
  playerId: getInitialPlayerId(),
  setPlayerId: (id) => {
    if (id) {
      localStorage.setItem("elemoria_player_id", id.toString());
    } else {
      localStorage.removeItem("elemoria_player_id");
    }
    set({ playerId: id });
  },
  activeBattleId: getInitialBattleId(),
  setActiveBattleId: (id) => {
    if (id) {
      localStorage.setItem("elemoria_battle_id", id.toString());
    } else {
      localStorage.removeItem("elemoria_battle_id");
    }
    set({ activeBattleId: id });
  },
}));
