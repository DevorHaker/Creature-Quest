import { Router } from "express";
import { db } from "@workspace/db";
import { playersTable, playerPokemonsTable, pokemonSpeciesTable } from "@workspace/db";
import { eq, count, sum } from "drizzle-orm";
import { CreatePlayerBody, UpdatePlayerProgressBody } from "@workspace/api-zod";
import { getRequestPlayer } from "../lib/player-context";

const router: Router = Router();

function formatPlayer(p: typeof playersTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    avatarColor: p.avatarColor,
    level: p.level,
    experience: p.experience,
    currency: p.currency,
    currentRegionId: p.currentRegionId,
    totalBattles: p.totalBattles,
    battlesWon: p.battlesWon,
    totalPokemonCaptured: p.totalPokemonCaptured,
    badges: p.badges,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/player", async (req, res) => {
  const player = await getRequestPlayer(req);
  if (!player) {
    res.status(404).json({ error: "No player found" });
    return;
  }
  res.json(formatPlayer(player));
});

router.post("/player", async (req, res) => {
  try {
    const body = CreatePlayerBody.parse(req.body);

    const [player] = await db
      .insert(playersTable)
      .values({
        name: body.name,
        avatarColor: body.avatarColor,
        level: 1,
        experience: 0,
        currency: 500,
        currentRegionId: 1,
        totalBattles: 0,
        battlesWon: 0,
        totalPokemonCaptured: 0,
        badges: [],
      })
      .returning();

    // Create and assign the starter Pokemon
    const [starterSpecies] = await db
      .select()
      .from(pokemonSpeciesTable)
      .where(eq(pokemonSpeciesTable.id, body.starterPokemonSpeciesId));

    if (!starterSpecies) {
      console.error(`Starter species not found for ID: ${body.starterPokemonSpeciesId}`);
      res.status(400).json({ error: "Invalid starter Pokémon selected" });
      return;
    }

    function calcHp(base: number, lvl: number) {
      return Math.floor((2 * base * lvl) / 100) + lvl + 10;
    }
    function calcStat(base: number, lvl: number) {
      return Math.floor((2 * base * lvl) / 100) + lvl + 5;
    }

    const lvl = 5;
    const moves = Array.isArray(starterSpecies.moveIds) ? starterSpecies.moveIds.slice(0, 4) : [];
    
    await db.insert(playerPokemonsTable).values({
      playerId: player.id,
      speciesId: starterSpecies.id,
      nickname: null,
      level: lvl,
      experience: 0,
      currentHp: calcHp(starterSpecies.baseHp, lvl),
      maxHp: calcHp(starterSpecies.baseHp, lvl),
      attack: calcStat(starterSpecies.baseAttack, lvl),
      defense: calcStat(starterSpecies.baseDefense, lvl),
      specialAttack: calcStat(starterSpecies.baseSpecialAttack, lvl),
      specialDefense: calcStat(starterSpecies.baseSpecialDefense, lvl),
      speed: calcStat(starterSpecies.baseSpeed, lvl),
      moveIds: moves,
      isInParty: true,
      partySlot: 0,
    });

    res.status(201).json(formatPlayer(player));
  } catch (error: any) {
    console.error("Failed to initialize adventure:", error);
    const message = error?.message || "Failed to initialize your adventure. Please try again.";
    res.status(error?.status || 500).json({ error: message });
  }
});

router.patch("/player/progress", async (req, res) => {
  const body = UpdatePlayerProgressBody.parse(req.body);
  const player = await getRequestPlayer(req);
  if (!player) {
    res.status(404).json({ error: "No player found" });
    return;
  }

  const updates: Partial<typeof playersTable.$inferInsert> = {};
  if (body.experience !== undefined) updates.experience = body.experience;
  if (body.currency !== undefined) updates.currency = body.currency;
  if (body.currentRegionId !== undefined) updates.currentRegionId = body.currentRegionId;
  if (body.totalBattles !== undefined) updates.totalBattles = body.totalBattles;
  if (body.battlesWon !== undefined) updates.battlesWon = body.battlesWon;
  if (body.totalPokemonCaptured !== undefined) updates.totalPokemonCaptured = body.totalPokemonCaptured;
  if (body.badges !== undefined) updates.badges = body.badges as string[];

  const exp = body.experience ?? player.experience;
  updates.level = Math.max(1, Math.floor(exp / 200) + 1);

  const [updated] = await db
    .update(playersTable)
    .set(updates)
    .where(eq(playersTable.id, player.id))
    .returning();

  res.json(formatPlayer(updated));
});

router.get("/summary", async (_req, res) => {
  const [playerCount] = await db.select({ count: count() }).from(playersTable);
  const [topPlayer] = await db
    .select({ name: playersTable.name, level: playersTable.level })
    .from(playersTable)
    .orderBy(playersTable.level)
    .limit(1);

  const [totals] = await db
    .select({
      totalPokemon: sum(playersTable.totalPokemonCaptured),
      totalBattles: sum(playersTable.totalBattles),
    })
    .from(playersTable);

  res.json({
    totalPlayers: playerCount.count,
    totalPokemonCaptured: Number(totals?.totalPokemon ?? 0),
    totalBattlesFought: Number(totals?.totalBattles ?? 0),
    totalSpeciesDiscovered: 20,
    topPlayerName: topPlayer?.name ?? "—",
    topPlayerLevel: topPlayer?.level ?? 0,
  });
});

export default router;
