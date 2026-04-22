import { Router } from "express";
import { db } from "@workspace/db";
import { playersTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router: Router = Router();

router.get("/leaderboard", async (_req, res) => {
  const players = await db
    .select()
    .from(playersTable)
    .orderBy(desc(playersTable.level), desc(playersTable.battlesWon))
    .limit(50);

  const result = players.map((p, index) => ({
    rank: index + 1,
    playerName: p.name,
    level: p.level,
    battlesWon: p.battlesWon,
    totalPokemonCaptured: p.totalPokemonCaptured,
    badges: p.badges,
  }));

  res.json(result);
});

export default router;
