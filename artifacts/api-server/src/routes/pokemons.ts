import { Router } from "express";
import { db } from "@workspace/db";
import { pokemonSpeciesTable, movesTable, playerPokemonsTable, playersTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import {
  CapturePokemonBody,
  UpdatePlayerPokemonBody,
  SetPlayerPartyBody,
  GetPokemonSpeciesParams,
  GetPlayerPokemonParams,
  UpdatePlayerPokemonParams,
} from "@workspace/api-zod";
import { getRequestPlayer } from "../lib/player-context";

const router: Router = Router();

async function getMovesForIds(moveIds: number[]) {
  if (moveIds.length === 0) return [];
  const moves = await db.select().from(movesTable).where(inArray(movesTable.id, moveIds));
  return moves.map((m) => ({
    id: m.id,
    name: m.name,
    type: m.type,
    power: m.power,
    accuracy: m.accuracy,
    pp: m.pp,
    category: m.category,
    description: m.description,
    effect: m.effect ?? undefined,
  }));
}

async function formatSpecies(s: typeof pokemonSpeciesTable.$inferSelect) {
  const moves = await getMovesForIds(s.moveIds);
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    type1: s.type1,
    type2: s.type2 ?? undefined,
    baseHp: s.baseHp,
    baseAttack: s.baseAttack,
    baseDefense: s.baseDefense,
    baseSpeed: s.baseSpeed,
    baseSpecialAttack: s.baseSpecialAttack,
    baseSpecialDefense: s.baseSpecialDefense,
    evolutionLevel: s.evolutionLevel ?? undefined,
    evolvesIntoId: s.evolvesIntoId ?? undefined,
    catchRate: s.catchRate,
    spriteUrl: s.spriteUrl,
    backSpriteUrl: s.backSpriteUrl,
    moves,
    rarity: s.rarity,
  };
}

async function formatPlayerPokemon(pa: typeof playerPokemonsTable.$inferSelect) {
  const [species] = await db.select().from(pokemonSpeciesTable).where(eq(pokemonSpeciesTable.id, pa.speciesId));
  const moves = await getMovesForIds(pa.moveIds);
  const formattedSpecies = await formatSpecies(species);
  return {
    id: pa.id,
    playerId: pa.playerId,
    speciesId: pa.speciesId,
    nickname: pa.nickname ?? undefined,
    level: pa.level,
    experience: pa.experience,
    currentHp: pa.currentHp,
    maxHp: pa.maxHp,
    attack: pa.attack,
    defense: pa.defense,
    speed: pa.speed,
    specialAttack: pa.specialAttack,
    specialDefense: pa.specialDefense,
    moves,
    isInParty: pa.isInParty,
    partySlot: pa.partySlot ?? undefined,
    statusCondition: pa.statusCondition ?? undefined,
    species: formattedSpecies,
    capturedAt: pa.capturedAt.toISOString(),
  };
}

function calcStats(base: number, level: number) {
  return Math.floor((2 * base * level) / 100) + level + 10;
}

function calcHp(baseHp: number, level: number) {
  return Math.floor((2 * baseHp * level) / 100) + level + 10;
}

// List all species (Pokedex)
router.get("/Pokemon", async (_req, res) => {
  const species = await db.select().from(pokemonSpeciesTable);
  const result = await Promise.all(species.map(formatSpecies));
  res.json(result);
});

// Get a specific species
router.get("/Pokemon/:id", async (req, res) => {
  const { id } = GetPokemonSpeciesParams.parse({ id: parseInt(req.params.id) });
  const [species] = await db.select().from(pokemonSpeciesTable).where(eq(pokemonSpeciesTable.id, id));
  if (!species) {
    res.status(404).json({ error: "Species not found" });
    return;
  }
  res.json(await formatSpecies(species));
});

// Get player's Pokemon
router.get("/player/Pokemon", async (req, res) => {
  const player = await getRequestPlayer(req);
  if (!player) {
    res.json([]);
    return;
  }
  const Pokemon = await db.select().from(playerPokemonsTable).where(eq(playerPokemonsTable.playerId, player.id));
  const result = await Promise.all(Pokemon.map(formatPlayerPokemon));
  res.json(result);
});

// Capture a new Pokemon
router.post("/player/Pokemon", async (req, res) => {
  const body = CapturePokemonBody.parse(req.body);

  const player = await getRequestPlayer(req);
  if (!player) {
    res.status(404).json({ error: "No player found" });
    return;
  }

  const [species] = await db.select().from(pokemonSpeciesTable).where(eq(pokemonSpeciesTable.id, body.speciesId));
  if (!species) {
    res.status(404).json({ error: "Species not found" });
    return;
  }

  const level = body.level ?? 5;
  const maxHp = calcHp(species.baseHp, level);

  // Assign first 4 moves from species
  const moveIds = species.moveIds.slice(0, 4);

  const [pa] = await db
    .insert(playerPokemonsTable)
    .values({
      playerId: player.id,
      speciesId: species.id,
      nickname: body.nickname ?? null,
      level,
      experience: 0,
      currentHp: maxHp,
      maxHp,
      attack: calcStats(species.baseAttack, level),
      defense: calcStats(species.baseDefense, level),
      speed: calcStats(species.baseSpeed, level),
      specialAttack: calcStats(species.baseSpecialAttack, level),
      specialDefense: calcStats(species.baseSpecialDefense, level),
      moveIds,
      isInParty: false,
    })
    .returning();

  res.status(201).json(await formatPlayerPokemon(pa));
});

// Get a specific player Pokemon
router.get("/player/Pokemon/:id", async (req, res) => {
  const { id } = GetPlayerPokemonParams.parse({ id: parseInt(req.params.id) });
  const [pa] = await db.select().from(playerPokemonsTable).where(eq(playerPokemonsTable.id, id));
  if (!pa) {
    res.status(404).json({ error: "Player Pokemon not found" });
    return;
  }
  res.json(await formatPlayerPokemon(pa));
});

// Update a player Pokemon
router.patch("/player/Pokemon/:id", async (req, res) => {
  const { id } = UpdatePlayerPokemonParams.parse({ id: parseInt(req.params.id) });
  const body = UpdatePlayerPokemonBody.parse(req.body);

  const [existing] = await db.select().from(playerPokemonsTable).where(eq(playerPokemonsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Player Pokemon not found" });
    return;
  }

  const updates: Partial<typeof playerPokemonsTable.$inferInsert> = {};
  if (body.nickname !== undefined) updates.nickname = body.nickname;
  if (body.currentHp !== undefined) updates.currentHp = body.currentHp;
  if (body.statusCondition !== undefined) updates.statusCondition = body.statusCondition;
  if (body.experience !== undefined) updates.experience = body.experience;
  if (body.level !== undefined) updates.level = body.level;

  // Handle evolution
  if (body.evolveToSpeciesId !== undefined) {
    const [newSpecies] = await db.select().from(pokemonSpeciesTable).where(eq(pokemonSpeciesTable.id, body.evolveToSpeciesId));
    if (newSpecies) {
      updates.speciesId = newSpecies.id;
      const newLevel = body.level ?? existing.level;
      updates.maxHp = calcHp(newSpecies.baseHp, newLevel);
      updates.currentHp = calcHp(newSpecies.baseHp, newLevel);
      updates.attack = calcStats(newSpecies.baseAttack, newLevel);
      updates.defense = calcStats(newSpecies.baseDefense, newLevel);
      updates.speed = calcStats(newSpecies.baseSpeed, newLevel);
      updates.specialAttack = calcStats(newSpecies.baseSpecialAttack, newLevel);
      updates.specialDefense = calcStats(newSpecies.baseSpecialDefense, newLevel);
      updates.moveIds = newSpecies.moveIds.slice(0, 4);
    }
  }

  const [updated] = await db
    .update(playerPokemonsTable)
    .set(updates)
    .where(eq(playerPokemonsTable.id, id))
    .returning();

  res.json(await formatPlayerPokemon(updated));
});

// Get player party
router.get("/player/party", async (req, res) => {
  const player = await getRequestPlayer(req);
  if (!player) {
    res.json([]);
    return;
  }
  const allPokemon = await db
    .select()
    .from(playerPokemonsTable)
    .where(eq(playerPokemonsTable.playerId, player.id));
  const party = allPokemon.filter((a) => a.isInParty);
  party.sort((a, b) => (a.partySlot ?? 99) - (b.partySlot ?? 99));
  const result = await Promise.all(party.map(formatPlayerPokemon));
  res.json(result);
});

// Set player party
router.post("/player/party", async (req, res) => {
  const body = SetPlayerPartyBody.parse(req.body);

  const player = await getRequestPlayer(req);
  if (!player) {
    res.status(404).json({ error: "No player found" });
    return;
  }

  // Clear all existing party members for THIS player only
  await db
    .update(playerPokemonsTable)
    .set({ isInParty: false, partySlot: null })
    .where(eq(playerPokemonsTable.playerId, player.id));

  // Set new party members
  for (let i = 0; i < body.pokemonIds.length; i++) {
    await db
      .update(playerPokemonsTable)
      .set({ isInParty: true, partySlot: i })
      .where(eq(playerPokemonsTable.id, body.pokemonIds[i]));
  }

  const allPlayerPokemon = await db
    .select()
    .from(playerPokemonsTable)
    .where(eq(playerPokemonsTable.playerId, player.id));
  const party = allPlayerPokemon.filter((a) => a.isInParty);
  party.sort((a, b) => (a.partySlot ?? 99) - (b.partySlot ?? 99));
  const result = await Promise.all(party.map(formatPlayerPokemon));
  res.json(result);
});

// Heal all player Pokemon
router.post("/player/heal", async (req, res) => {
  const player = await getRequestPlayer(req);
  if (!player) {
    res.status(404).json({ error: "No player found" });
    return;
  }

  // Get all player's Pokemon
  const Pokemon = await db
    .select()
    .from(playerPokemonsTable)
    .where(eq(playerPokemonsTable.playerId, player.id));

  // Update them to full HP
  for (const pa of Pokemon) {
    if (pa.currentHp < pa.maxHp || pa.statusCondition) {
      await db
        .update(playerPokemonsTable)
        .set({ currentHp: pa.maxHp, statusCondition: null })
        .where(eq(playerPokemonsTable.id, pa.id));
    }
  }

  res.json({ success: true });
});

export default router;
