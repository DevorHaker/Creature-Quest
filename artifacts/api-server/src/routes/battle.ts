import { Router } from "express";
import { db } from "@workspace/db";
import {
  battlesTable,
  playerPokemonsTable,
  pokemonSpeciesTable,
  movesTable,
  playersTable,
  regionsTable,
} from "@workspace/db";
import { eq, inArray, desc } from "drizzle-orm";
import {
  StartBattleBody,
  PerformBattleActionBody,
  GetBattleParams,
  PerformBattleActionParams,
} from "@workspace/api-zod";
import { getRequestPlayer } from "../lib/player-context";

const router: Router = Router();

// Type chart for damage multipliers
const TYPE_CHART: Record<string, Record<string, number>> = {
  Fire: { Nature: 2, Crystal: 2, Air: 0.5, Water: 0.5, Earth: 0.5 },
  Water: { Fire: 2, Earth: 2, Air: 0.5, Nature: 0.5 },
  Nature: { Water: 2, Earth: 2, Fire: 0.5, Air: 0.5 },
  Earth: { Fire: 2, Lightning: 2, Water: 0.5, Nature: 0.5 },
  Air: { Earth: 2, Lightning: 2, Fire: 0.5 },
  Lightning: { Water: 2, Air: 2, Earth: 0.5 },
  Shadow: { Arcane: 2, Crystal: 2, Nature: 0.5 },
  Crystal: { Shadow: 2, Nature: 2, Fire: 0.5 },
  Arcane: { Shadow: 2, Lightning: 2 },
  Void: { Arcane: 2, Fire: 2, Crystal: 0.5 },
};

function getTypeMultiplier(attackType: string, defType1: string, defType2?: string | null): number {
  let mult = TYPE_CHART[attackType]?.[defType1] ?? 1;
  if (defType2) {
    mult *= TYPE_CHART[attackType]?.[defType2] ?? 1;
  }
  return mult;
}

function calcDamage(
  power: number,
  attackStat: number,
  defenseStat: number,
  level: number,
  typeMultiplier: number
): number {
  const base = ((2 * level) / 5 + 2) * power * (attackStat / defenseStat) / 50 + 2;
  const variance = 0.85 + Math.random() * 0.15;
  return Math.max(1, Math.floor(base * typeMultiplier * variance));
}

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

function buildBattlePokemonFromPlayer(
  pa: typeof playerPokemonsTable.$inferSelect,
  species: typeof pokemonSpeciesTable.$inferSelect,
  moves: ReturnType<typeof getMovesForIds> extends Promise<infer T> ? T : never
) {
  return {
    playerPokemonId: pa.id,
    speciesId: species.id,
    name: pa.nickname ?? species.name,
    level: pa.level,
    currentHp: pa.currentHp,
    maxHp: pa.maxHp,
    moves,
    statusCondition: pa.statusCondition ?? undefined,
    spriteUrl: species.spriteUrl,
    backSpriteUrl: species.backSpriteUrl,
    type1: species.type1,
    type2: species.type2 ?? undefined,
    attack: pa.attack,
    defense: pa.defense,
    specialAttack: pa.specialAttack,
    specialDefense: pa.specialDefense,
    speed: pa.speed,
  };
}

function buildWildOpponent(species: typeof pokemonSpeciesTable.$inferSelect, level: number, moves: any[]) {
  function calcHp(base: number, lvl: number) {
    return Math.floor((2 * base * lvl) / 100) + lvl + 10;
  }
  function calcStat(base: number, lvl: number) {
    return Math.floor((2 * base * lvl) / 100) + lvl + 5;
  }
  const hp = calcHp(species.baseHp, level);
  return {
    playerPokemonId: null,
    speciesId: species.id,
    name: species.name,
    level,
    currentHp: hp,
    maxHp: hp,
    moves,
    statusCondition: undefined,
    spriteUrl: species.spriteUrl,
    backSpriteUrl: species.backSpriteUrl,
    type1: species.type1,
    type2: species.type2 ?? undefined,
    attack: calcStat(species.baseAttack, level),
    defense: calcStat(species.baseDefense, level),
    specialAttack: calcStat(species.baseSpecialAttack, level),
    specialDefense: calcStat(species.baseSpecialDefense, level),
    speed: calcStat(species.baseSpeed, level),
  };
}

function formatBattleState(battle: typeof battlesTable.$inferSelect) {
  return {
    id: battle.id,
    type: battle.type,
    status: battle.status,
    turn: battle.turn,
    playerPokemon: battle.playerPokemonData as any,
    opponentPokemon: battle.opponentPokemonData as any,
    playerParty: battle.playerPartyData as any[],
    requiresSwitch: battle.requiresSwitch,
    log: battle.log,
    canCapture: battle.canCapture,
    result: battle.result ?? undefined,
    expGained: battle.expGained ?? undefined,
    currencyGained: battle.currencyGained ?? undefined,
  };
}

// Start battle
router.post("/battle/start", async (req, res, next) => {
  try {
    const body = StartBattleBody.parse(req.body);

    const player = await getRequestPlayer(req);
    if (!player) {
      res.status(404).json({ error: "No player found" });
      return;
    }

    // Get player's lead party Pokemon
    const partyPokemon = await db
      .select()
      .from(playerPokemonsTable)
      .where(eq(playerPokemonsTable.playerId, player.id))
      .then((rows) => rows.filter((r) => r.isInParty));
    partyPokemon.sort((a, b) => (a.partySlot ?? 99) - (b.partySlot ?? 99));

    if (partyPokemon.length === 0) {
      res.status(400).json({ error: "No party Pokemon available. Add some Pokémon to your party first!" });
      return;
    }

    const healthyPartyPokemon = partyPokemon.filter(pa => pa.currentHp > 0);
    
    if (healthyPartyPokemon.length === 0) {
      res.status(400).json({ error: "Your active party has fainted! Please heal your Pokemon before battling." });
      return;
    }

    // Build battle team (up to 3 party Pokemon, restricted to healthy ones)
    const battleTeam = healthyPartyPokemon.slice(0, 3);
    const battleTeamData = await Promise.all(
      battleTeam.map(async (pa) => {
        const [species] = await db
          .select()
          .from(pokemonSpeciesTable)
          .where(eq(pokemonSpeciesTable.id, pa.speciesId));
        const moves = await getMovesForIds(pa.moveIds);
        return buildBattlePokemonFromPlayer(pa, species, moves);
      })
    );

    const playerPokemonData = battleTeamData[0];
    const playerPartyData = battleTeamData.slice(1) as any[];

    // Get region for wild encounter
    const [region] = await db
      .select()
      .from(regionsTable)
      .where(eq(regionsTable.id, body.regionId));

    let opponentPokemonData: any;
    const wildSpeciesIds = region?.wildPokemonSpeciesIds ?? [];
    let opponentSpeciesId: number;

    if (wildSpeciesIds.length > 0) {
      opponentSpeciesId = wildSpeciesIds[Math.floor(Math.random() * wildSpeciesIds.length)];
    } else {
      // Fallback: random species
      const allSpecies = await db.select({ id: pokemonSpeciesTable.id }).from(pokemonSpeciesTable);
      if (allSpecies.length === 0) {
        res.status(500).json({ error: "No Pokemon species found in database." });
        return;
      }
      opponentSpeciesId = allSpecies[Math.floor(Math.random() * allSpecies.length)].id;
    }

    const [opponentSpecies] = await db
      .select()
      .from(pokemonSpeciesTable)
      .where(eq(pokemonSpeciesTable.id, opponentSpeciesId));

    const minLevel = region?.minLevel ?? 3;
    const maxLevel = region?.maxLevel ?? 10;
    const wildLevel = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
    const wildMoves = await getMovesForIds(opponentSpecies.moveIds.slice(0, 4));
    opponentPokemonData = buildWildOpponent(opponentSpecies, wildLevel, wildMoves);

    const isTrainer = body.battleType === "trainer";
    const trainerLevel = body.trainerLevel ?? wildLevel;

    if (isTrainer) {
      // For trainer: pick a different species
      const allSpecies = await db.select().from(pokemonSpeciesTable);
      const trainerSpecies = allSpecies[Math.floor(Math.random() * allSpecies.length)];
      const trainerMoves = await getMovesForIds(trainerSpecies.moveIds.slice(0, 4));
      opponentPokemonData = buildWildOpponent(trainerSpecies, trainerLevel, trainerMoves);
      opponentPokemonData.name = `Rival's ${trainerSpecies.name}`;
    }

    const [battle] = await db
      .insert(battlesTable)
      .values({
        playerId: player.id,
        type: body.battleType,
        status: "active",
        turn: 1,
        playerPokemonData: playerPokemonData as any,
        opponentPokemonData: opponentPokemonData as any,
        playerPartyData: playerPartyData as any[],
        requiresSwitch: false,
        log: [`A wild ${opponentPokemonData.name} (Lv.${wildLevel}) appeared!`, `Go, ${playerPokemonData.name}!`],
        canCapture: body.battleType === "wild",
      })
      .returning();

    res.status(201).json(formatBattleState(battle));
  } catch (err) {
    next(err);
  }
});

// Get battle state
router.get("/battle/:battleId", async (req, res) => {
  const { battleId } = GetBattleParams.parse({ battleId: parseInt(req.params.battleId) });
  const [battle] = await db.select().from(battlesTable).where(eq(battlesTable.id, battleId));
  if (!battle) {
    res.status(404).json({ error: "Battle not found" });
    return;
  }
  res.json(formatBattleState(battle));
});

// Perform battle action
router.post("/battle/:battleId/action", async (req, res) => {
  const { battleId } = PerformBattleActionParams.parse({ battleId: parseInt(req.params.battleId) });
  const body = PerformBattleActionBody.parse(req.body);

  const [battle] = await db.select().from(battlesTable).where(eq(battlesTable.id, battleId));
  if (!battle || battle.status !== "active") {
    res.status(400).json({ error: "Battle not found or already ended" });
    return;
  }

  // Get the player associated with this battle
  const [battlePlayer] = await db.select().from(playersTable).where(eq(playersTable.id, battle.playerId));

  let playerPokemon = { ...(battle.playerPokemonData as any) };
  let opponentPokemon = { ...(battle.opponentPokemonData as any) };
  let playerPartyData = [...(battle.playerPartyData as any[])];
  let requiresSwitch = battle.requiresSwitch;
  const log = [...battle.log];
  let result: string | null = null;
  let expGained: number | null = null;
  let currencyGained: number | null = null;
  let status = battle.status;

  if (requiresSwitch && body.action !== "switch") {
    res.status(400).json({ error: "You must switch your fainted Pokemon!" });
    return;
  }

  if (body.action === "flee") {
    log.push(`${playerPokemon.name} fled from battle!`);
    result = "fled";
    status = "ended";
  } else if (body.action === "capture") {
    // Capture attempt
    const species = await db
      .select()
      .from(pokemonSpeciesTable)
      .where(eq(pokemonSpeciesTable.id, opponentPokemon.speciesId));
    const catchRate = species[0]?.catchRate ?? 45;
    const hpRatio = opponentPokemon.currentHp / opponentPokemon.maxHp;
    const captureChance = (catchRate / 255) * (1 - hpRatio * 0.5) + 0.1;

    if (Math.random() < captureChance) {
      log.push(`You captured ${opponentPokemon.name}!`);
      result = "captured";
      status = "ended";
      expGained = Math.floor(opponentPokemon.level * 50 * (1 + Math.random() * 0.5));
      currencyGained = Math.floor(50 + opponentPokemon.level * 10);

      // Actually capture the Pokemon
      const player = battlePlayer;
      if (player) {
        function calcHp(base: number, lvl: number) {
          return Math.floor((2 * base * lvl) / 100) + lvl + 10;
        }
        function calcStat(base: number, lvl: number) {
          return Math.floor((2 * base * lvl) / 100) + lvl + 5;
        }
        const sp = species[0];
        const lvl = opponentPokemon.level;
        await db.insert(playerPokemonsTable).values({
          playerId: player.id,
          speciesId: opponentPokemon.speciesId,
          level: lvl,
          experience: 0,
          currentHp: calcHp(sp.baseHp, lvl),
          maxHp: calcHp(sp.baseHp, lvl),
          attack: calcStat(sp.baseAttack, lvl),
          defense: calcStat(sp.baseDefense, lvl),
          speed: calcStat(sp.baseSpeed, lvl),
          specialAttack: calcStat(sp.baseSpecialAttack, lvl),
          specialDefense: calcStat(sp.baseSpecialDefense, lvl),
          moveIds: sp.moveIds.slice(0, 4),
          isInParty: false,
        });
        // Update player capture count
        await db
          .update(playersTable)
          .set({
            totalPokemonsCaptured: player.totalPokemonsCaptured + 1,
            currency: player.currency + (currencyGained ?? 0),
            experience: player.experience + (expGained ?? 0),
          })
          .where(eq(playersTable.id, player.id));
      }
    } else {
      log.push(`${opponentPokemon.name} broke free from the orb!`);
      // AI attacks back
      const aiMove = opponentPokemon.moves[Math.floor(Math.random() * opponentPokemon.moves.length)];
      if (aiMove && playerPokemon.currentHp > 0) {
        const mult = getTypeMultiplier(aiMove.type, playerPokemon.type1, playerPokemon.type2);
        const damage = calcDamage(aiMove.power, opponentPokemon.attack, playerPokemon.defense, opponentPokemon.level, mult);
        playerPokemon.currentHp = Math.max(0, playerPokemon.currentHp - damage);
        log.push(`${opponentPokemon.name} used ${aiMove.name}! It dealt ${damage} damage.`);
        if (playerPokemon.currentHp === 0) {
          log.push(`${playerPokemon.name} fainted!`);
          
          const hasAliveParty = playerPartyData.some((a) => a.currentHp > 0);
          if (hasAliveParty) {
            requiresSwitch = true;
            log.push(`Choose your next Pokemon!`);
          } else {
            result = "lost";
            status = "ended";
          }
        }
      }
    }
  } else if (body.action === "attack" && body.moveId !== undefined) {
    // Player attacks
    const playerMove = playerPokemon.moves.find((m: any) => m.id === body.moveId);
    if (!playerMove) {
      res.status(400).json({ error: "Move not found" });
      return;
    }

    // Check accuracy
    const hitChance = playerMove.accuracy / 100;
    if (Math.random() > hitChance) {
      log.push(`${playerPokemon.name} used ${playerMove.name} but missed!`);
    } else {
      const isSpecial = playerMove.category === "special";
      const attackStat = isSpecial ? playerPokemon.specialAttack : playerPokemon.attack;
      const defenseStat = isSpecial ? opponentPokemon.specialDefense : opponentPokemon.defense;
      const mult = getTypeMultiplier(playerMove.type, opponentPokemon.type1, opponentPokemon.type2);
      const damage = calcDamage(playerMove.power, attackStat, defenseStat, playerPokemon.level, mult);
      opponentPokemon.currentHp = Math.max(0, opponentPokemon.currentHp - damage);

      const effectMsg =
        mult >= 2 ? " It's super effective!" : mult <= 0.5 ? " It's not very effective..." : "";
      log.push(`${playerPokemon.name} used ${playerMove.name}! It dealt ${damage} damage.${effectMsg}`);
    }

    // Check if opponent fainted
    if (opponentPokemon.currentHp <= 0) {
      log.push(`${opponentPokemon.name} fainted!`);
      result = "won";
      status = "ended";
      expGained = Math.floor(opponentPokemon.level * 75 * (1 + Math.random() * 0.5));
      currencyGained = Math.floor(75 + opponentPokemon.level * 15);

      // Award exp and currency to player
      const player = battlePlayer;
      if (player) {
        const newExp = player.experience + (expGained ?? 0);
        const newLevel = Math.max(1, Math.floor(newExp / 200) + 1);
        await db
          .update(playersTable)
          .set({
            experience: newExp,
            level: newLevel,
            currency: player.currency + (currencyGained ?? 0),
            battlesWon: player.battlesWon + 1,
            totalBattles: player.totalBattles + 1,
          })
          .where(eq(playersTable.id, player.id));

        // Also give exp to player's Pokemon
        if (playerPokemon.playerPokemonId) {
          const [pa] = await db
            .select()
            .from(playerPokemonsTable)
            .where(eq(playerPokemonsTable.id, playerPokemon.playerPokemonId));
          if (pa) {
            const newPokemonExp = pa.experience + (expGained ?? 0);
            // Compute level from EXP, but never allow level to DECREASE
            const computedLevel = Math.max(1, Math.floor(newPokemonExp / 150) + 1);
            const newPokemonLevel = Math.max(pa.level, computedLevel);
            playerPokemon.level = newPokemonLevel;
            playerPokemon.experience = newPokemonExp;
            await db
              .update(playerPokemonsTable)
              .set({ experience: newPokemonExp, level: newPokemonLevel })
              .where(eq(playerPokemonsTable.id, playerPokemon.playerPokemonId));
          }
        }
      }
    } else {
      // AI attacks back
      const aiMove = opponentPokemon.moves[Math.floor(Math.random() * opponentPokemon.moves.length)];
      if (aiMove) {
        const aiHitChance = aiMove.accuracy / 100;
        if (Math.random() > aiHitChance) {
          log.push(`${opponentPokemon.name} used ${aiMove.name} but missed!`);
        } else {
          const isSpecial = aiMove.category === "special";
          const atkStat = isSpecial ? opponentPokemon.specialAttack : opponentPokemon.attack;
          const defStat = isSpecial ? playerPokemon.specialDefense : playerPokemon.defense;
          const mult = getTypeMultiplier(aiMove.type, playerPokemon.type1, playerPokemon.type2);
          const damage = calcDamage(aiMove.power, atkStat, defStat, opponentPokemon.level, mult);
          playerPokemon.currentHp = Math.max(0, playerPokemon.currentHp - damage);

          const effectMsg =
            mult >= 2 ? " It's super effective!" : mult <= 0.5 ? " It's not very effective..." : "";
          log.push(`${opponentPokemon.name} used ${aiMove.name}! It dealt ${damage} damage.${effectMsg}`);

          if (playerPokemon.currentHp === 0) {
            log.push(`${playerPokemon.name} fainted!`);
            
            const hasAliveParty = playerPartyData.some((a) => a.currentHp > 0);
            if (hasAliveParty) {
              requiresSwitch = true;
              log.push(`Choose your next Pokemon!`);
            } else {
              result = "lost";
              status = "ended";

              // Update battle count for player
              const player = battlePlayer;
              if (player) {
                await db
                  .update(playersTable)
                  .set({ totalBattles: player.totalBattles + 1 })
                  .where(eq(playersTable.id, player.id));
              }
            }
          }
        }
      }
    }

    // Update player Pokemon HP in DB
    if (playerPokemon.playerPokemonId) {
      await db
        .update(playerPokemonsTable)
        .set({ currentHp: playerPokemon.currentHp })
        .where(eq(playerPokemonsTable.id, playerPokemon.playerPokemonId));
    }
  } else if (body.action === "switch" && body.switchToPokemonId !== undefined) {
    const targetPokemonId = body.switchToPokemonId;
    const targetIdx = playerPartyData.findIndex((a: any) => a.playerPokemonId === targetPokemonId);
    if (targetIdx === -1 || playerPartyData[targetIdx].currentHp <= 0) {
      res.status(400).json({ error: "Invalid switch target or target fainted" });
      return;
    }

    const newActive = playerPartyData[targetIdx];
    playerPartyData[targetIdx] = playerPokemon;
    playerPokemon = newActive;
    log.push(`Come back ${playerPartyData[targetIdx].name}! Go, ${playerPokemon.name}!`);

    const wasForcedSwitch = requiresSwitch;
    requiresSwitch = false;

    // If it wasn't a forced switch, the AI gets a free hit
    if (!wasForcedSwitch && opponentPokemon.currentHp > 0) {
      const aiMove = opponentPokemon.moves[Math.floor(Math.random() * opponentPokemon.moves.length)];
      if (aiMove) {
        const aiHitChance = aiMove.accuracy / 100;
        if (Math.random() > aiHitChance) {
          log.push(`${opponentPokemon.name} used ${aiMove.name} but missed!`);
        } else {
          const isSpecial = aiMove.category === "special";
          const atkStat = isSpecial ? opponentPokemon.specialAttack : opponentPokemon.attack;
          const defStat = isSpecial ? playerPokemon.specialDefense : playerPokemon.defense;
          const mult = getTypeMultiplier(aiMove.type, playerPokemon.type1, playerPokemon.type2);
          const damage = calcDamage(aiMove.power, atkStat, defStat, opponentPokemon.level, mult);
          playerPokemon.currentHp = Math.max(0, playerPokemon.currentHp - damage);

          const effectMsg =
            mult >= 2 ? " It's super effective!" : mult <= 0.5 ? " It's not very effective..." : "";
          log.push(`${opponentPokemon.name} used ${aiMove.name}! It dealt ${damage} damage.${effectMsg}`);

          if (playerPokemon.currentHp === 0) {
            log.push(`${playerPokemon.name} fainted!`);
            
            const hasAliveParty = playerPartyData.some((a) => a.currentHp > 0);
            if (hasAliveParty) {
              requiresSwitch = true;
              log.push(`Choose your next Pokemon!`);
            } else {
              result = "lost";
              status = "ended";

              const player = battlePlayer;
              if (player) {
                await db
                  .update(playersTable)
                  .set({ totalBattles: player.totalBattles + 1 })
                  .where(eq(playersTable.id, player.id));
              }
            }
          }
        }
      }
    }
  }

  const [updated] = await db
    .update(battlesTable)
    .set({
      playerPokemonData: playerPokemon,
      opponentPokemonData: opponentPokemon,
      playerPartyData,
      requiresSwitch,
      log,
      turn: battle.turn + 1,
      status,
      result,
      expGained,
      currencyGained,
      updatedAt: new Date(),
    })
    .where(eq(battlesTable.id, battleId))
    .returning();

  res.json(formatBattleState(updated));
});

// Get battle history
router.get("/battle/history", async (req, res) => {
  const player = await getRequestPlayer(req);
  if (!player) {
    res.json([]);
    return;
  }

  const battles = await db
    .select()
    .from(battlesTable)
    .where(eq(battlesTable.playerId, player.id))
    .orderBy(desc(battlesTable.createdAt))
    .limit(20);

  const result = battles
    .filter((b) => b.status === "ended")
    .map((b) => ({
      id: b.id,
      type: b.type,
      result: b.result ?? "unknown",
      opponentName: (b.opponentPokemonData as any)?.name ?? "Unknown",
      expGained: b.expGained ?? 0,
      currencyGained: b.currencyGained ?? 0,
      createdAt: b.createdAt.toISOString(),
    }));

  res.json(result);
});

export default router;
