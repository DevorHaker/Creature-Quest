import { db } from "@workspace/db";
import { movesTable, pokemonSpeciesTable, regionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const NEW_MOVES = [
  // Fire/Flying
  { name: "Thermal Draft", type: "Fire", power: 70, accuracy: 100, pp: 15, category: "special", description: "Rides a draft of hot air to burn the foe." },
  { name: "Firestorm Dive", type: "Flying", power: 95, accuracy: 85, pp: 10, category: "physical", description: "Dives furiously wrapped in burning winds." },
  // Water/Ice
  { name: "Reflective Ripple", type: "Water", power: 65, accuracy: 100, pp: 20, category: "special", description: "Water hits the foe and glitters like glass." },
  { name: "Sharp Shell", type: "Ice", power: 90, accuracy: 90, pp: 15, category: "physical", description: "Slashes the enemy with crystalline armor." },
  // Ghost/Grass
  { name: "Midnight Spores", type: "Ghost", power: 55, accuracy: 95, pp: 20, category: "special", description: "Dark, chilling spores that choke the enemy." },
  { name: "Decay Vine", type: "Grass", power: 85, accuracy: 100, pp: 10, category: "physical", description: "Whips the foe with vines dripping with rot." },
  // Electric/Dragon
  { name: "Empty Current", type: "Dragon", power: 80, accuracy: 90, pp: 15, category: "special", description: "A shock that feels like stepping into nothingness." },
  { name: "Void Shock", type: "Electric", power: 100, accuracy: 80, pp: 10, category: "special", description: "Calls a lightning bolt from the void dimensions." },
  // Ground/Psychic
  { name: "Magic Mud", type: "Ground", power: 60, accuracy: 100, pp: 20, category: "special", description: "Throws enchanted soil that burns with mana." },
  { name: "Clay Sigil", type: "Psychic", power: 85, accuracy: 95, pp: 15, category: "special", description: "Traps the foe in a magical earthen seal." },
];

const NEW_SPECIES = [
  {
    name: "Fletchinder",
    description: "A small bird with feathers that glow like dying embers.",
    type1: "Fire", type2: "Flying",
    baseHp: 40, baseAttack: 55, baseDefense: 35, baseSpeed: 80, baseSpecialAttack: 65, baseSpecialDefense: 45,
    evolutionLevel: 20, catchRate: 50, rarity: "common",
    spriteUrl: "/api/sprites/fletchinder", backSpriteUrl: "/api/sprites/fletchinder-back",
    moveNames: ["Thermal Draft", "Gust Slash", "Ember Blast"],
  },
  {
    name: "Talonflame",
    description: "A fearsome bird of prey that leaves trails of fire when it flies. Evolved from Fletchinder.",
    type1: "Fire", type2: "Flying",
    baseHp: 70, baseAttack: 95, baseDefense: 60, baseSpeed: 110, baseSpecialAttack: 90, baseSpecialDefense: 70,
    evolutionLevel: null, catchRate: 20, rarity: "rare",
    spriteUrl: "/api/sprites/talonflame", backSpriteUrl: "/api/sprites/talonflame-back",
    moveNames: ["Firestorm Dive", "Thermal Draft", "Inferno Wave", "Cyclone Dive"],
  },
  {
    name: "Spheal",
    description: "A serene fish with scales that reflect light like precious gemstones.",
    type1: "Water", type2: "Ice",
    baseHp: 55, baseAttack: 40, baseDefense: 65, baseSpeed: 50, baseSpecialAttack: 60, baseSpecialDefense: 55,
    evolutionLevel: 18, catchRate: 55, rarity: "common",
    spriteUrl: "/api/sprites/spheal", backSpriteUrl: "/api/sprites/spheal-back",
    moveNames: ["Reflective Ripple", "Tide Strike", "Crystal Shard"],
  },
  {
    name: "Walrein",
    description: "A heavy crustacean with an unbreakable crystal shell. Evolved from Spheal.",
    type1: "Water", type2: "Ice",
    baseHp: 85, baseAttack: 75, baseDefense: 115, baseSpeed: 60, baseSpecialAttack: 80, baseSpecialDefense: 90,
    evolutionLevel: null, catchRate: 25, rarity: "rare",
    spriteUrl: "/api/sprites/walrein", backSpriteUrl: "/api/sprites/walrein-back",
    moveNames: ["Sharp Shell", "Reflective Ripple", "Cascade Torrent", "Gem Storm"],
  },
  {
    name: "Phantump",
    description: "A glowing mushroom creature found only in the darkest parts of the forest.",
    type1: "Ghost", type2: "Grass",
    baseHp: 60, baseAttack: 45, baseDefense: 50, baseSpeed: 40, baseSpecialAttack: 70, baseSpecialDefense: 65,
    evolutionLevel: 22, catchRate: 45, rarity: "uncommon",
    spriteUrl: "/api/sprites/phantump", backSpriteUrl: "/api/sprites/phantump-back",
    moveNames: ["Midnight Spores", "Thorn Whip", "Shade Claw"],
  },
  {
    name: "Trevenant",
    description: "A terrifying fungal giant that feeds on shadow essence. Evolved from Phantump.",
    type1: "Ghost", type2: "Grass",
    baseHp: 100, baseAttack: 80, baseDefense: 85, baseSpeed: 45, baseSpecialAttack: 105, baseSpecialDefense: 95,
    evolutionLevel: null, catchRate: 15, rarity: "rare",
    spriteUrl: "/api/sprites/trevenant", backSpriteUrl: "/api/sprites/trevenant-back",
    moveNames: ["Decay Vine", "Midnight Spores", "Dark Pulse", "Root Slam"],
  },
  {
    name: "Dracozolt",
    description: "A tiny floating anomaly that discharges strange, dark electricity.",
    type1: "Electric", type2: "Dragon",
    baseHp: 45, baseAttack: 40, baseDefense: 45, baseSpeed: 75, baseSpecialAttack: 85, baseSpecialDefense: 50,
    evolutionLevel: 25, catchRate: 35, rarity: "uncommon",
    spriteUrl: "/api/sprites/dracozolt", backSpriteUrl: "/api/sprites/dracozolt-back",
    moveNames: ["Empty Current", "Spark Bolt", "Null Touch"],
  },
  {
    name: "Zekrom",
    description: "An unstable storm of void energy that threatens to collapse in on itself. Evolved from Dracozolt.",
    type1: "Electric", type2: "Dragon",
    baseHp: 75, baseAttack: 60, baseDefense: 70, baseSpeed: 105, baseSpecialAttack: 135, baseSpecialDefense: 80,
    evolutionLevel: null, catchRate: 10, rarity: "legendary",
    spriteUrl: "/api/sprites/zekrom", backSpriteUrl: "/api/sprites/zekrom-back",
    moveNames: ["Void Shock", "Empty Current", "Thunder Crash", "Oblivion Beam"],
  },
  {
    name: "Sandile",
    description: "A small clay doll brought to life by mysterious ancient magic.",
    type1: "Ground", type2: "Dark",
    baseHp: 65, baseAttack: 50, baseDefense: 75, baseSpeed: 30, baseSpecialAttack: 60, baseSpecialDefense: 70,
    evolutionLevel: 21, catchRate: 45, rarity: "common",
    spriteUrl: "/api/sprites/sandile", backSpriteUrl: "/api/sprites/sandile-back",
    moveNames: ["Magic Mud", "Stone Crush", "Arcane Bolt"],
  },
  {
    name: "Krookodile",
    description: "A master of earthen magic that can shape entire battlefields. Evolved from Sandile.",
    type1: "Ground", type2: "Dark",
    baseHp: 105, baseAttack: 75, baseDefense: 110, baseSpeed: 45, baseSpecialAttack: 95, baseSpecialDefense: 100,
    evolutionLevel: null, catchRate: 15, rarity: "rare",
    spriteUrl: "/api/sprites/krookodile", backSpriteUrl: "/api/sprites/krookodile-back",
    moveNames: ["Clay Sigil", "Magic Mud", "Quake Slam", "Reality Break"],
  }
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
    { name: "Talonflame", evolvesFrom: "Fletchinder" },
    { name: "Walrein", evolvesFrom: "Spheal" },
    { name: "Trevenant", evolvesFrom: "Phantump" },
    { name: "Zekrom", evolvesFrom: "Dracozolt" },
    { name: "Krookodile", evolvesFrom: "Sandile" },
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
