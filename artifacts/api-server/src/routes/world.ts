import { Router } from "express";
import { db } from "@workspace/db";
import { regionsTable, PokemonpeciesTable, movesTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { GetRegionWildPokemonParams } from "@workspace/api-zod";

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

router.get("/world/regions", async (_req, res) => {
  const regions = await db.select().from(regionsTable);
  res.json(
    regions.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      minLevel: r.minLevel,
      maxLevel: r.maxLevel,
      biome: r.biome,
      isUnlocked: r.isUnlocked,
      unlockRequirement: r.unlockRequirement ?? undefined,
      imageUrl: r.imageUrl,
    }))
  );
});

router.get("/world/regions/:id/wild-Pokemon", async (req, res) => {
  const { id } = GetRegionWildPokemonParams.parse({ id: parseInt(req.params.id) });
  const [region] = await db.select().from(regionsTable).where(eq(regionsTable.id, id));
  if (!region) {
    res.status(404).json({ error: "Region not found" });
    return;
  }

  const speciesIds = region.wildPokemonpeciesIds;
  if (speciesIds.length === 0) {
    res.json([]);
    return;
  }

  const speciesList = await db
    .select()
    .from(PokemonpeciesTable)
    .where(inArray(PokemonpeciesTable.id, speciesIds));

  const result = await Promise.all(
    speciesList.map(async (species) => {
      const moves = await getMovesForIds(species.moveIds);
      return {
        speciesId: species.id,
        species: {
          id: species.id,
          name: species.name,
          description: species.description,
          type1: species.type1,
          type2: species.type2 ?? undefined,
          baseHp: species.baseHp,
          baseAttack: species.baseAttack,
          baseDefense: species.baseDefense,
          baseSpeed: species.baseSpeed,
          baseSpecialAttack: species.baseSpecialAttack,
          baseSpecialDefense: species.baseSpecialDefense,
          evolutionLevel: species.evolutionLevel ?? undefined,
          evolvesIntoId: species.evolvesIntoId ?? undefined,
          catchRate: species.catchRate,
          spriteUrl: species.spriteUrl,
          backSpriteUrl: species.backSpriteUrl,
          moves,
          rarity: species.rarity,
        },
        minLevel: region.minLevel,
        maxLevel: region.maxLevel,
        encounterRate: 0.15 + Math.random() * 0.1,
      };
    })
  );

  res.json(result);
});

export default router;
