import { db } from "@workspace/db";
import {
  movesTable,
  PokemonpeciesTable,
  regionsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

const MOVES = [
  // Fire moves
  { name: "Ember Blast", type: "Fire", power: 40, accuracy: 100, pp: 25, category: "special", description: "A small burst of ember that may inflict burn." },
  { name: "Inferno Wave", type: "Fire", power: 90, accuracy: 85, pp: 10, category: "special", description: "A massive wave of scorching fire." },
  { name: "Cinder Claw", type: "Fire", power: 65, accuracy: 100, pp: 15, category: "physical", description: "Slashes with blazing claws." },
  { name: "Magma Surge", type: "Fire", power: 110, accuracy: 75, pp: 5, category: "special", description: "An overwhelming eruption of magma." },
  // Water moves
  { name: "Tide Strike", type: "Water", power: 40, accuracy: 100, pp: 25, category: "physical", description: "A quick strike using rushing water." },
  { name: "Cascade Torrent", type: "Water", power: 90, accuracy: 85, pp: 10, category: "special", description: "A powerful torrent that washes away enemies." },
  { name: "Frost Jet", type: "Water", power: 65, accuracy: 100, pp: 15, category: "special", description: "A freezing jet of water." },
  // Ground moves
  { name: "Stone Crush", type: "Ground", power: 50, accuracy: 100, pp: 20, category: "physical", description: "Crushes the enemy with a heavy stone." },
  { name: "Quake Slam", type: "Ground", power: 100, accuracy: 80, pp: 10, category: "physical", description: "A devastating ground slam that shakes the earth." },
  { name: "Boulder Toss", type: "Ground", power: 75, accuracy: 90, pp: 15, category: "physical", description: "Hurls a massive boulder at the enemy." },
  // Flying moves
  { name: "Gust Slash", type: "Flying", power: 40, accuracy: 100, pp: 25, category: "physical", description: "Slashes with a razor-sharp gust of wind." },
  { name: "Cyclone Dive", type: "Flying", power: 85, accuracy: 90, pp: 10, category: "physical", description: "Dives through a whirling cyclone." },
  { name: "Aero Blade", type: "Flying", power: 60, accuracy: 100, pp: 20, category: "physical", description: "A blade of compressed air." },
  // Electric moves
  { name: "Spark Bolt", type: "Electric", power: 40, accuracy: 100, pp: 25, category: "special", description: "Fires a spark of electricity." },
  { name: "Thunder Crash", type: "Electric", power: 110, accuracy: 70, pp: 10, category: "special", description: "Calls down a devastating bolt of thunder." },
  { name: "Chain Zap", type: "Electric", power: 65, accuracy: 95, pp: 15, category: "special", description: "Chains lightning across multiple targets." },
  // Ghost moves
  { name: "Shade Claw", type: "Ghost", power: 50, accuracy: 100, pp: 20, category: "physical", description: "Claws with dark energy." },
  { name: "Void Rip", type: "Ghost", power: 80, accuracy: 85, pp: 10, category: "special", description: "Tears a rift in reality." },
  { name: "Dark Pulse", type: "Ghost", power: 80, accuracy: 100, pp: 15, category: "special", description: "A wave of dark energy." },
  // Ice moves
  { name: "Crystal Shard", type: "Ice", power: 50, accuracy: 95, pp: 20, category: "physical", description: "Fires razor-sharp crystal shards." },
  { name: "Prism Beam", type: "Ice", power: 90, accuracy: 85, pp: 10, category: "special", description: "A prismatic beam of crystalline energy." },
  { name: "Gem Storm", type: "Ice", power: 70, accuracy: 90, pp: 15, category: "special", description: "A storm of crystalline shards." },
  // Grass moves
  { name: "Thorn Whip", type: "Grass", power: 45, accuracy: 100, pp: 25, category: "physical", description: "Strikes with a thorned vine whip." },
  { name: "Petal Storm", type: "Grass", power: 80, accuracy: 90, pp: 15, category: "special", description: "Calls a storm of razor-edged petals." },
  { name: "Root Slam", type: "Grass", power: 65, accuracy: 95, pp: 20, category: "physical", description: "Slams with powerful roots." },
  // Psychic moves
  { name: "Arcane Bolt", type: "Psychic", power: 55, accuracy: 100, pp: 20, category: "special", description: "Fires a bolt of arcane energy." },
  { name: "Reality Break", type: "Psychic", power: 100, accuracy: 75, pp: 5, category: "special", description: "Breaks the fabric of reality itself." },
  { name: "Rune Strike", type: "Psychic", power: 70, accuracy: 95, pp: 15, category: "physical", description: "Strikes with rune-infused power." },
  // Dragon moves
  { name: "Null Touch", type: "Dragon", power: 60, accuracy: 100, pp: 20, category: "special", description: "Nullifies matter with a touch." },
  { name: "Oblivion Beam", type: "Dragon", power: 120, accuracy: 65, pp: 5, category: "special", description: "Fires a beam of pure nothingness." },
  { name: "Abyss Tear", type: "Dragon", power: 80, accuracy: 90, pp: 10, category: "special", description: "Tears open an abyss beneath the enemy." },
];

const SPECIES = [
  // Starters
  {
    name: "Charmander",
    description: "A fiery fox-like creature with a blazing tail. Known for its fierce loyalty and explosive temper.",
    type1: "Fire", type2: null,
    baseHp: 45, baseAttack: 60, baseDefense: 40, baseSpeed: 65, baseSpecialAttack: 55, baseSpecialDefense: 45,
    evolutionLevel: 16, catchRate: 45, rarity: "uncommon",
    spriteUrl: "/api/sprites/charmander", backSpriteUrl: "/api/sprites/charmander-back",
    moveNames: ["Ember Blast", "Cinder Claw", "Gust Slash", "Stone Crush"],
  },
  {
    name: "Chandelure",
    description: "The evolved form of Charmander. Its fur burns with intense ethereal flames.",
    type1: "Fire", type2: "Ghost",
    baseHp: 65, baseAttack: 90, baseDefense: 60, baseSpeed: 95, baseSpecialAttack: 80, baseSpecialDefense: 65,
    evolutionLevel: null, catchRate: 25, rarity: "rare",
    spriteUrl: "/api/sprites/chandelure", backSpriteUrl: "/api/sprites/chandelure-back",
    moveNames: ["Inferno Wave", "Cinder Claw", "Dark Pulse", "Magma Surge"],
  },
  {
    name: "Squirtle",
    description: "A sleek water serpent that glides effortlessly through the deepest oceans.",
    type1: "Water", type2: null,
    baseHp: 50, baseAttack: 45, baseDefense: 55, baseSpeed: 60, baseSpecialAttack: 65, baseSpecialDefense: 60,
    evolutionLevel: 18, catchRate: 45, rarity: "uncommon",
    spriteUrl: "/api/sprites/squirtle", backSpriteUrl: "/api/sprites/squirtle-back",
    moveNames: ["Tide Strike", "Frost Jet", "Thorn Whip", "Gust Slash"],
  },
  {
    name: "Lanturn",
    description: "The evolved form of Squirtle. Commands the tides with its mind.",
    type1: "Water", type2: "Electric",
    baseHp: 75, baseAttack: 65, baseDefense: 70, baseSpeed: 85, baseSpecialAttack: 95, baseSpecialDefense: 80,
    evolutionLevel: null, catchRate: 25, rarity: "rare",
    spriteUrl: "/api/sprites/lanturn", backSpriteUrl: "/api/sprites/lanturn-back",
    moveNames: ["Cascade Torrent", "Chain Zap", "Thunder Crash", "Frost Jet"],
  },
  {
    name: "Chikorita",
    description: "A small plant-like creature with crystalline leaves that absorb sunlight.",
    type1: "Grass", type2: null,
    baseHp: 55, baseAttack: 50, baseDefense: 60, baseSpeed: 45, baseSpecialAttack: 50, baseSpecialDefense: 65,
    evolutionLevel: 15, catchRate: 45, rarity: "common",
    spriteUrl: "/api/sprites/chikorita", backSpriteUrl: "/api/sprites/chikorita-back",
    moveNames: ["Thorn Whip", "Root Slam", "Stone Crush", "Gust Slash"],
  },
  {
    name: "Torterra",
    description: "A towering forest guardian with ancient runes etched into its bark.",
    type1: "Grass", type2: "Ground",
    baseHp: 80, baseAttack: 75, baseDefense: 90, baseSpeed: 50, baseSpecialAttack: 70, baseSpecialDefense: 85,
    evolutionLevel: null, catchRate: 20, rarity: "rare",
    spriteUrl: "/api/sprites/torterra", backSpriteUrl: "/api/sprites/torterra-back",
    moveNames: ["Petal Storm", "Quake Slam", "Root Slam", "Boulder Toss"],
  },
  {
    name: "Pichu",
    description: "A quick-moving creature that generates electricity as it runs.",
    type1: "Electric", type2: null,
    baseHp: 45, baseAttack: 55, baseDefense: 40, baseSpeed: 90, baseSpecialAttack: 70, baseSpecialDefense: 45,
    evolutionLevel: 20, catchRate: 45, rarity: "uncommon",
    spriteUrl: "/api/sprites/pichu", backSpriteUrl: "/api/sprites/pichu-back",
    moveNames: ["Spark Bolt", "Chain Zap", "Aero Blade", "Tide Strike"],
  },
  {
    name: "Zapdos",
    description: "Controls lightning storms with frightening precision. Evolved form of Pichu.",
    type1: "Electric", type2: "Flying",
    baseHp: 65, baseAttack: 75, baseDefense: 55, baseSpeed: 120, baseSpecialAttack: 100, baseSpecialDefense: 60,
    evolutionLevel: null, catchRate: 20, rarity: "rare",
    spriteUrl: "/api/sprites/zapdos", backSpriteUrl: "/api/sprites/zapdos-back",
    moveNames: ["Thunder Crash", "Cyclone Dive", "Chain Zap", "Aero Blade"],
  },
  {
    name: "Misdreavus",
    description: "A moth-like creature that weaves shadows into its wings.",
    type1: "Ghost", type2: null,
    baseHp: 50, baseAttack: 65, baseDefense: 45, baseSpeed: 70, baseSpecialAttack: 75, baseSpecialDefense: 55,
    evolutionLevel: 22, catchRate: 35, rarity: "uncommon",
    spriteUrl: "/api/sprites/misdreavus", backSpriteUrl: "/api/sprites/misdreavus-back",
    moveNames: ["Shade Claw", "Dark Pulse", "Void Rip", "Gust Slash"],
  },
  {
    name: "Giratina",
    description: "A spectral dragon born from pure shadow energy. Evolved from Misdreavus.",
    type1: "Ghost", type2: "Dragon",
    baseHp: 75, baseAttack: 95, baseDefense: 65, baseSpeed: 90, baseSpecialAttack: 110, baseSpecialDefense: 80,
    evolutionLevel: null, catchRate: 10, rarity: "legendary",
    spriteUrl: "/api/sprites/giratina", backSpriteUrl: "/api/sprites/giratina-back",
    moveNames: ["Void Rip", "Oblivion Beam", "Dark Pulse", "Abyss Tear"],
  },
  {
    name: "Snorunt",
    description: "A small mineral creature with a heart made of pure crystal.",
    type1: "Ice", type2: null,
    baseHp: 45, baseAttack: 45, baseDefense: 75, baseSpeed: 40, baseSpecialAttack: 60, baseSpecialDefense: 70,
    evolutionLevel: 18, catchRate: 40, rarity: "common",
    spriteUrl: "/api/sprites/snorunt", backSpriteUrl: "/api/sprites/snorunt-back",
    moveNames: ["Crystal Shard", "Stone Crush", "Gem Storm", "Boulder Toss"],
  },
  {
    name: "Jynx",
    description: "A dazzling creature of pure crystalline energy. Evolved form of Snorunt.",
    type1: "Ice", type2: "Psychic",
    baseHp: 65, baseAttack: 70, baseDefense: 100, baseSpeed: 60, baseSpecialAttack: 95, baseSpecialDefense: 90,
    evolutionLevel: null, catchRate: 15, rarity: "rare",
    spriteUrl: "/api/sprites/jynx", backSpriteUrl: "/api/sprites/jynx-back",
    moveNames: ["Prism Beam", "Arcane Bolt", "Gem Storm", "Rune Strike"],
  },
  {
    name: "Swablu",
    description: "A wisp-like creature that rides the wind currents invisibly.",
    type1: "Flying", type2: null,
    baseHp: 45, baseAttack: 40, baseDefense: 35, baseSpeed: 95, baseSpecialAttack: 70, baseSpecialDefense: 55,
    evolutionLevel: 17, catchRate: 40, rarity: "common",
    spriteUrl: "/api/sprites/swablu", backSpriteUrl: "/api/sprites/swablu-back",
    moveNames: ["Gust Slash", "Aero Blade", "Cyclone Dive", "Spark Bolt"],
  },
  {
    name: "Emolga",
    description: "A sky sovereign that rules over the highest mountain peaks. Evolved form of Swablu.",
    type1: "Flying", type2: "Electric",
    baseHp: 70, baseAttack: 65, baseDefense: 55, baseSpeed: 115, baseSpecialAttack: 90, baseSpecialDefense: 75,
    evolutionLevel: null, catchRate: 15, rarity: "rare",
    spriteUrl: "/api/sprites/emolga", backSpriteUrl: "/api/sprites/emolga-back",
    moveNames: ["Cyclone Dive", "Thunder Crash", "Aero Blade", "Chain Zap"],
  },
  {
    name: "Sandshrew",
    description: "An ancient earth lizard with stone armor that has hardened over centuries.",
    type1: "Ground", type2: null,
    baseHp: 65, baseAttack: 70, baseDefense: 80, baseSpeed: 35, baseSpecialAttack: 45, baseSpecialDefense: 60,
    evolutionLevel: 20, catchRate: 35, rarity: "common",
    spriteUrl: "/api/sprites/terraddon", backSpriteUrl: "/api/sprites/sandshrew-back",
    moveNames: ["Stone Crush", "Quake Slam", "Boulder Toss", "Root Slam"],
  },
  {
    name: "Camerupt",
    description: "A mountain-sized earth titan that can reshape the land with a stomp. Evolved form of Sandshrew.",
    type1: "Ground", type2: "Fire",
    baseHp: 95, baseAttack: 100, baseDefense: 110, baseSpeed: 45, baseSpecialAttack: 60, baseSpecialDefense: 80,
    evolutionLevel: null, catchRate: 10, rarity: "legendary",
    spriteUrl: "/api/sprites/camerupt", backSpriteUrl: "/api/sprites/camerupt-back",
    moveNames: ["Quake Slam", "Magma Surge", "Boulder Toss", "Inferno Wave"],
  },
  {
    name: "Abra",
    description: "A young spellcaster wrapped in robes of living arcane energy.",
    type1: "Psychic", type2: null,
    baseHp: 45, baseAttack: 35, baseDefense: 35, baseSpeed: 60, baseSpecialAttack: 80, baseSpecialDefense: 65,
    evolutionLevel: 25, catchRate: 30, rarity: "uncommon",
    spriteUrl: "/api/sprites/abra", backSpriteUrl: "/api/sprites/abra-back",
    moveNames: ["Arcane Bolt", "Rune Strike", "Reality Break", "Dark Pulse"],
  },
  {
    name: "Mr. Mime",
    description: "A grand arcane master who can rewrite the rules of magic. Evolved form of Abra.",
    type1: "Psychic", type2: "Ice",
    baseHp: 70, baseAttack: 55, baseDefense: 60, baseSpeed: 85, baseSpecialAttack: 130, baseSpecialDefense: 95,
    evolutionLevel: null, catchRate: 10, rarity: "legendary",
    spriteUrl: "/api/sprites/mr.-mime", backSpriteUrl: "/api/sprites/mr.-mime-back",
    moveNames: ["Reality Break", "Prism Beam", "Arcane Bolt", "Rune Strike"],
  },
  {
    name: "Dratini",
    description: "A mysterious creature born from nothingness. Its true form is unknowable.",
    type1: "Dragon", type2: null,
    baseHp: 50, baseAttack: 55, baseDefense: 50, baseSpeed: 75, baseSpecialAttack: 85, baseSpecialDefense: 60,
    evolutionLevel: 28, catchRate: 15, rarity: "rare",
    spriteUrl: "/api/sprites/dratini", backSpriteUrl: "/api/sprites/dratini-back",
    moveNames: ["Null Touch", "Abyss Tear", "Shade Claw", "Void Rip"],
  },
  {
    name: "Dragapult",
    description: "An entity of pure void. It consumes reality wherever it goes. Evolved form of Dratini.",
    type1: "Dragon", type2: "Ghost",
    baseHp: 80, baseAttack: 90, baseDefense: 80, baseSpeed: 100, baseSpecialAttack: 150, baseSpecialDefense: 100,
    evolutionLevel: null, catchRate: 5, rarity: "legendary",
    spriteUrl: "/api/sprites/dragapult", backSpriteUrl: "/api/sprites/dragapult-back",
    moveNames: ["Oblivion Beam", "Void Rip", "Abyss Tear", "Null Touch"],
  },
];

const REGIONS = [
  {
    name: "Emberveil Meadows",
    description: "Rolling grasslands near volcanic hot springs. Warm breezes carry the scent of sulfur and wildflowers.",
    minLevel: 1,
    maxLevel: 10,
    biome: "meadow",
    isUnlocked: true,
    unlockRequirement: null,
    imageUrl: "/api/region-images/emberveil",
  },
  {
    name: "Aqua Labyrinth",
    description: "A maze of underwater caverns and glimmering coral reefs hidden beneath the Shimmering Sea.",
    minLevel: 8,
    maxLevel: 18,
    biome: "aquatic",
    isUnlocked: true,
    unlockRequirement: null,
    imageUrl: "/api/region-images/aqua-labyrinth",
  },
  {
    name: "Thornwood Depths",
    description: "An ancient forest where the trees grow so tall they pierce the clouds. Strange runes glow on their bark.",
    minLevel: 15,
    maxLevel: 25,
    biome: "forest",
    isUnlocked: true,
    unlockRequirement: null,
    imageUrl: "/api/region-images/thornwood",
  },
  {
    name: "Storm Peaks",
    description: "Jagged mountain peaks permanently wreathed in lightning storms. Only the bravest trainers dare enter.",
    minLevel: 22,
    maxLevel: 35,
    biome: "mountain",
    isUnlocked: false,
    unlockRequirement: "Earn the Thundercrest Badge",
    imageUrl: "/api/region-images/storm-peaks",
  },
  {
    name: "Shadow Sanctum",
    description: "A realm where sunlight never reaches. Ancient creatures lurk in the perpetual darkness.",
    minLevel: 30,
    maxLevel: 45,
    biome: "shadow",
    isUnlocked: false,
    unlockRequirement: "Earn the Nightfall Badge",
    imageUrl: "/api/region-images/shadow-sanctum",
  },
  {
    name: "Void Rift",
    description: "A dimensional tear in reality. The most dangerous region in Elemoria, home to the rarest Pokemon.",
    minLevel: 40,
    maxLevel: 60,
    biome: "void",
    isUnlocked: false,
    unlockRequirement: "Collect all 8 Badges",
    imageUrl: "/api/region-images/void-rift",
  },
];

export async function seed() {
  console.log("Starting seed...");

  // Check if already seeded
  const existingMoves = await db.select().from(movesTable).limit(1);
  if (existingMoves.length > 0) {
    console.log("Already seeded, skipping.");
    return;
  }

  // Insert moves
  console.log("Seeding moves...");
  const insertedMoves = await db.insert(movesTable).values(MOVES).returning();
  const moveMap = new Map(insertedMoves.map((m) => [m.name, m.id]));

  // Insert species
  console.log("Seeding species...");
  const evolutionLinks: Array<{ name: string; evolvesFrom: string }> = [
    { name: "Chandelure", evolvesFrom: "Charmander" },
    { name: "Lanturn", evolvesFrom: "Squirtle" },
    { name: "Torterra", evolvesFrom: "Chikorita" },
    { name: "Zapdos", evolvesFrom: "Pichu" },
    { name: "Giratina", evolvesFrom: "Misdreavus" },
    { name: "Jynx", evolvesFrom: "Snorunt" },
    { name: "Emolga", evolvesFrom: "Swablu" },
    { name: "Camerupt", evolvesFrom: "Sandshrew" },
    { name: "Mr. Mime", evolvesFrom: "Abra" },
    { name: "Dragapult", evolvesFrom: "Dratini" },
  ];

  // Insert species without evolution links first
  const speciesInserts = SPECIES.map((s) => ({
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

  const insertedSpecies = await db.insert(PokemonpeciesTable).values(speciesInserts).returning();
  const speciesMap = new Map(insertedSpecies.map((s) => [s.name, s.id]));

  // Update evolution links
  for (const link of evolutionLinks) {
    const evolvedId = speciesMap.get(link.name);
    const baseId = speciesMap.get(link.evolvesFrom);
    if (evolvedId && baseId) {
      await db
        .update(PokemonpeciesTable)
        .set({ evolvesIntoId: evolvedId })
        .where(eq(PokemonpeciesTable.id, baseId));
    }
  }

  // Insert regions with correct wild Pokemon species
  console.log("Seeding regions...");
  const regionSpeciesMap: Record<string, string[]> = {
    "Emberveil Meadows": ["Charmander", "Chikorita", "Swablu", "Snorunt"],
    "Aqua Labyrinth": ["Squirtle", "Pichu", "Snorunt", "Swablu"],
    "Thornwood Depths": ["Torterra", "Misdreavus", "Sandshrew", "Chikorita"],
    "Storm Peaks": ["Zapdos", "Emolga", "Pichu", "Abra"],
    "Shadow Sanctum": ["Misdreavus", "Giratina", "Dratini", "Abra"],
    "Void Rift": ["Dragapult", "Dratini", "Mr. Mime", "Giratina"],
  };

  const regionInserts = REGIONS.map((r) => ({
    ...r,
    wildPokemonpeciesIds: (regionSpeciesMap[r.name] ?? []).map((name) => speciesMap.get(name) ?? 1),
  }));

  await db.insert(regionsTable).values(regionInserts);

  console.log("Seed completed!");
}
