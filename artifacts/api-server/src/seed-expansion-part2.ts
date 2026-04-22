import { db } from "@workspace/db";
import { movesTable, pokemonSpeciesTable, regionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const NEW_MOVES = [
  // Fire/Flying
  { name: "Flame Charge", type: "Fire", power: 50, accuracy: 100, pp: 20, category: "physical", description: "The user cloaks itself with flame and attacks. Building up momentum, it raises its Speed stat." },
  { name: "Overheat", type: "Fire", power: 130, accuracy: 90, pp: 5, category: "special", description: "The user attacks the target at full power. The attack's recoil harshly lowers the user's Sp. Atk stat." },
  // Water/Ice
  { name: "Water Spout", type: "Water", power: 150, accuracy: 100, pp: 5, category: "special", description: "The user spouts water to damage opposing Pokemon. The lower the user's HP, the lower the move's power." },
  { name: "Icicle Spear", type: "Ice", power: 25, accuracy: 100, pp: 30, category: "physical", description: "The user launches sharp icicles at the target two to five times in a row." },
  // Ghost/Grass
  { name: "Wood Hammer", type: "Grass", power: 120, accuracy: 100, pp: 15, category: "physical", description: "The user slams its rugged body into the target to attack. This also damages the user quite a lot." },
  { name: "Horn Leech", type: "Grass", power: 75, accuracy: 100, pp: 10, category: "physical", description: "The user drains energy from the target via its horns. The user's HP is restored by half the damage taken by the target." },
  // Electric/Dragon
  { name: "Bolt Beak", type: "Electric", power: 85, accuracy: 100, pp: 10, category: "physical", description: "The user stabs the target with its electrified beak. If the user attacks before the target, this move's power is doubled." },
  { name: "Fusion Bolt", type: "Electric", power: 100, accuracy: 100, pp: 5, category: "physical", description: "The user throws down a giant lightning bolt. This move's power is boosted if it is used after Fusion Flare." },
  // Ground/Dark
  { name: "Crunch", type: "Dark", power: 80, accuracy: 100, pp: 15, category: "physical", description: "The user crunches up the target with sharp fangs. This may also lower the target's Defense stat." },
  { name: "Snarl", type: "Dark", power: 55, accuracy: 95, pp: 15, category: "special", description: "The user yells as if it’re ranting about something, which lowers the Sp. Atk stat of opposing Pokemon." },
];

const NEW_SPECIES = [
  {
    name: "Fletchling",
    description: "These Pokemon are normally very friendly. But once they're in battle, they can be surprisingly fierce.",
    type1: "Normal", type2: "Flying",
    baseHp: 45, baseAttack: 50, baseDefense: 43, baseSpeed: 62, baseSpecialAttack: 40, baseSpecialDefense: 38,
    evolutionLevel: 17, catchRate: 255, rarity: "common",
    spriteUrl: "/api/sprites/fletchling", backSpriteUrl: "/api/sprites/fletchling-back",
    moveNames: ["Gust", "Tackle", "Flame Charge"],
  },
  {
    name: "Fletchinder",
    description: "The hotter the flame in its internal fire sac, the faster it can fly. It scatters embers from its bill when it flies.",
    type1: "Fire", type2: "Flying",
    baseHp: 62, baseAttack: 73, baseDefense: 55, baseSpeed: 84, baseSpecialAttack: 56, baseSpecialDefense: 52,
    evolutionLevel: 35, catchRate: 120, rarity: "uncommon",
    spriteUrl: "/api/sprites/fletchinder", backSpriteUrl: "/api/sprites/fletchinder-back",
    moveNames: ["Flame Charge", "Acrobatics", "Overheat"],
  },
  {
    name: "Talonflame",
    description: "In the fever of an exciting battle, it showers embers from the gaps between its feathers and takes to the air.",
    type1: "Fire", type2: "Flying",
    baseHp: 78, baseAttack: 81, baseDefense: 71, baseSpeed: 126, baseSpecialAttack: 74, baseSpecialDefense: 69,
    evolutionLevel: null, catchRate: 45, rarity: "rare",
    spriteUrl: "/api/sprites/talonflame", backSpriteUrl: "/api/sprites/talonflame-back",
    moveNames: ["Flare Blitz", "Flame Charge", "Acrobatics", "Overheat"],
  },
  {
    name: "Spheal",
    description: "It is much faster to roll than to walk. When it sees another Spheal, it will roll over to it.",
    type1: "Water", type2: "Ice",
    baseHp: 70, baseAttack: 40, baseDefense: 50, baseSpeed: 25, baseSpecialAttack: 55, baseSpecialDefense: 50,
    evolutionLevel: 32, catchRate: 255, rarity: "common",
    spriteUrl: "/api/sprites/spheal", backSpriteUrl: "/api/sprites/spheal-back",
    moveNames: ["Water Pulse", "Powder Snow", "Water Spout"],
  },
  {
    name: "Sealeo",
    description: "It habitually spins everything it sees on its nose. It is known to spin its eigene Spheal as well.",
    type1: "Water", type2: "Ice",
    baseHp: 90, baseAttack: 60, baseDefense: 70, baseSpeed: 45, baseSpecialAttack: 75, baseSpecialDefense: 70,
    evolutionLevel: 44, catchRate: 120, rarity: "uncommon",
    spriteUrl: "/api/sprites/sealeo", backSpriteUrl: "/api/sprites/sealeo-back",
    moveNames: ["Ice Beam", "Water Pulse", "Icicle Spear"],
  },
  {
    name: "Walrein",
    description: "It shatters ice with its big tusks. Its thick layer of blubber keep it warm in subzero temperatures.",
    type1: "Water", type2: "Ice",
    baseHp: 110, baseAttack: 80, baseDefense: 90, baseSpeed: 65, baseSpecialAttack: 95, baseSpecialDefense: 90,
    evolutionLevel: null, catchRate: 45, rarity: "rare",
    spriteUrl: "/api/sprites/walrein", backSpriteUrl: "/api/sprites/walrein-back",
    moveNames: ["Blizzard", "Hydro Pump", "Walrus Slam", "Icicle Spear"],
  },
  {
    name: "Phantump",
    description: "These Pokemon are created when spirits possess rotten tree stumps. They prefer to live in abandoned forests.",
    type1: "Ghost", type2: "Grass",
    baseHp: 43, baseAttack: 70, baseDefense: 48, baseSpeed: 38, baseSpecialAttack: 50, baseSpecialDefense: 60,
    evolutionLevel: 35, catchRate: 120, rarity: "uncommon",
    spriteUrl: "/api/sprites/phantump", backSpriteUrl: "/api/sprites/phantump-back",
    moveNames: ["Shadow Sneak", "Vine Whip", "Lick"],
  },
  {
    name: "Trevenant",
    description: "It can control trees at will. It will trap people who do harm to the forest and never let them out.",
    type1: "Ghost", type2: "Grass",
    baseHp: 85, baseAttack: 110, baseDefense: 76, baseSpeed: 56, baseSpecialAttack: 65, baseSpecialDefense: 82,
    evolutionLevel: null, catchRate: 60, rarity: "rare",
    spriteUrl: "/api/sprites/trevenant", backSpriteUrl: "/api/sprites/trevenant-back",
    moveNames: ["Wood Hammer", "Phantom Force", "Horn Leech", "Shadow Ball"],
  },
  {
    name: "Dracozolt",
    description: "In ancient times, it was unbeatable thanks to its powerful lower body, but it went extinct anyway.",
    type1: "Electric", type2: "Dragon",
    baseHp: 90, baseAttack: 100, baseDefense: 90, baseSpeed: 75, baseSpecialAttack: 80, baseSpecialDefense: 70,
    evolutionLevel: null, catchRate: 45, rarity: "rare",
    spriteUrl: "/api/sprites/dracozolt", backSpriteUrl: "/api/sprites/dracozolt-back",
    moveNames: ["Bolt Beak", "Dragon Pulse", "Thunderbolt"],
  },
  {
    name: "Zekrom",
    description: "This Pokemon appears in legends. It conceals itself in thunderclouds and flies through the sky.",
    type1: "Dragon", type2: "Electric",
    baseHp: 100, baseAttack: 150, baseDefense: 120, baseSpeed: 90, baseSpecialAttack: 120, baseSpecialDefense: 100,
    evolutionLevel: null, catchRate: 3, rarity: "legendary",
    spriteUrl: "/api/sprites/zekrom", backSpriteUrl: "/api/sprites/zekrom-back",
    moveNames: ["Fusion Bolt", "Outrage", "Dragon Claw", "Thunderbolt"],
  },
  {
    name: "Sandile",
    description: "It lives buried in the sands of the desert. The dark membrane around its eyes shields them from the sun.",
    type1: "Ground", type2: "Dark",
    baseHp: 50, baseAttack: 72, baseDefense: 35, baseSpeed: 65, baseSpecialAttack: 35, baseSpecialDefense: 35,
    evolutionLevel: 29, catchRate: 255, rarity: "common",
    spriteUrl: "/api/sprites/sandile", backSpriteUrl: "/api/sprites/sandile-back",
    moveNames: ["Mud-Slap", "Bite", "Sand Tomb"],
  },
  {
    name: "Krokorok",
    description: "It lives in groups of a few individuals. The protective membrane over its eyes shields them from sandstorms.",
    type1: "Ground", type2: "Dark",
    baseHp: 60, baseAttack: 82, baseDefense: 45, baseSpeed: 74, baseSpecialAttack: 45, baseSpecialDefense: 45,
    evolutionLevel: 40, catchRate: 90, rarity: "uncommon",
    spriteUrl: "/api/sprites/krokorok", backSpriteUrl: "/api/sprites/krokorok-back",
    moveNames: ["Crunch", "Earthquake", "Bite"],
  },
  {
    name: "Krookodile",
    description: "It has very strong jaws. It can even crush the shell of a Shellder with ease.",
    type1: "Ground", type2: "Dark",
    baseHp: 95, baseAttack: 117, baseDefense: 80, baseSpeed: 92, baseSpecialAttack: 65, baseSpecialDefense: 70,
    evolutionLevel: null, catchRate: 45, rarity: "rare",
    spriteUrl: "/api/sprites/krookodile", backSpriteUrl: "/api/sprites/krookodile-back",
    moveNames: ["Earthquake", "Crunch", "Snarl", "Outrage"],
  },
];

export async function expandPart2() {
  console.log("Starting Pokemon expansion part 2...");

  // Insert any currently missing moves
  const existingMoves = await db.select().from(movesTable);
  const existingMoveNames = new Set(existingMoves.map((m: any) => m.name));
  
  const movesToInsert = NEW_MOVES.filter((m) => !existingMoveNames.has(m.name));
  if (movesToInsert.length > 0) {
    console.log(`Inserting ${movesToInsert.length} new unique moves...`);
    await db.insert(movesTable).values(movesToInsert);
  } else {
    console.log("New moves already exist.");
  }

  // Refetch all moves to get maps
  const allMoves = await db.select().from(movesTable);
  const moveMap = new Map(allMoves.map((m: any) => [m.name, m.id]));

  // Insert any currently missing species
  const existingSpecies = await db.select().from(pokemonSpeciesTable);
  const existingSpeciesNames = new Set(existingSpecies.map((s: any) => s.name));

  const evolutionLinks: Array<{ name: string; evolvesFrom: string }> = [
    { name: "Fletchinder", evolvesFrom: "Fletchling" },
    { name: "Talonflame", evolvesFrom: "Fletchinder" },
    { name: "Sealeo", evolvesFrom: "Spheal" },
    { name: "Walrein", evolvesFrom: "Sealeo" },
    { name: "Trevenant", evolvesFrom: "Phantump" },
    { name: "Krokorok", evolvesFrom: "Sandile" },
    { name: "Krookodile", evolvesFrom: "Krokorok" },
  ];

  const speciesToInsert = NEW_SPECIES.filter((s) => !existingSpeciesNames.has(s.name));
  if (speciesToInsert.length > 0) {
    console.log(`Inserting ${speciesToInsert.length} new species...`);
    const speciesInserts = speciesToInsert.map((s) => ({
      name: s.name,
      description: s.description,
      type1: s.type1,
      type2: s.type2 ?? null,
      baseHp: s.baseHp,
      baseAttack: s.baseAttack,
      baseDefense: s.baseDefense,
      baseSpeed: s.baseSpeed,
      baseSpecialAttack: s.baseSpecialAttack,
      baseSpecialDefense: s.baseSpecialDefense,
      evolutionLevel: s.evolutionLevel ?? null,
      evolvesIntoId: null as number | null,
      catchRate: s.catchRate,
      spriteUrl: s.spriteUrl,
      backSpriteUrl: s.backSpriteUrl,
      moveIds: (s.moveNames ?? []).map((mn) => moveMap.get(mn) ?? 1),
      rarity: s.rarity,
    }));

    await db.insert(pokemonSpeciesTable).values(speciesInserts);
  } else {
    console.log("New species already exist.");
  }

  // Refetch all species for evolution links and region spawns
  const allSpecies = await db.select().from(pokemonSpeciesTable);
  const speciesMap = new Map(allSpecies.map((s: any) => [s.name, s.id]));

  console.log("Updating evolution links...");
  for (const link of evolutionLinks) {
    const evolvedId = speciesMap.get(link.name);
    const baseId = speciesMap.get(link.evolvesFrom);
    if (evolvedId && baseId) {
      await db
        .update(pokemonSpeciesTable)
        .set({ evolvesIntoId: evolvedId })
        .where(eq(pokemonSpeciesTable.id, baseId));
    }
  }

  console.log("Populating new species into diverse regions...");
  // Spread new species across regions
  const newRegionSpeciesMap: Record<string, string[]> = {
    "Emberveil Meadows": ["Fletchinder", "Sandile"],
    "Aqua Labyrinth": ["Spheal", "Fletchinder"],
    "Thornwood Depths": ["Phantump", "Spheal"],
    "Storm Peaks": ["Fletchinder", "Dracozolt"],
    "Shadow Sanctum": ["Phantump", "Dracozolt"],
    "Void Rift": ["Dracozolt", "Sandile"],
  };

  const allRegions = await db.select().from(regionsTable);
  for (const region of allRegions) {
    const additionalSpeciesNames = newRegionSpeciesMap[region.name] || [];
    if (additionalSpeciesNames.length > 0) {
      const additionalSpeciesIds = additionalSpeciesNames
        .map(name => speciesMap.get(name))
        .filter((id): id is number => id !== undefined);

      const existingSets = new Set(region.wildPokemonSpeciesIds || []);
      for (const aid of additionalSpeciesIds) {
        existingSets.add(aid);
      }
      
      await db
        .update(regionsTable)
        .set({ wildPokemonSpeciesIds: Array.from(existingSets) })
        .where(eq(regionsTable.id, region.id));
    }
  }

  console.log("Expansion Part 2 successfully injected into db.");
}

expandPart2()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
