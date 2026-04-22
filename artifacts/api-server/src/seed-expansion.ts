import { db } from "@workspace/db";
import { movesTable, pokemonSpeciesTable, regionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const NEW_MOVES = [
  // Fire/Water
  { name: "Steam Scald", type: "Water", power: 65, accuracy: 100, pp: 15, category: "special", description: "Blasts the target with boiling steam." },
  { name: "Boiling Geyser", type: "Fire", power: 95, accuracy: 85, pp: 10, category: "special", description: "Erupts a geyser of superheated water and magma." },
  // Ground/Flying
  { name: "Grit Blast", type: "Ground", power: 55, accuracy: 95, pp: 20, category: "special", description: "Blows coarse sand into the enemy's eyes." },
  { name: "Tornado Toss", type: "Flying", power: 100, accuracy: 80, pp: 10, category: "physical", description: "Uses a mini-tornado to hurl heavy rocks." },
  // Ghost/Electric
  { name: "Shadow Zap", type: "Ghost", power: 60, accuracy: 100, pp: 20, category: "special", description: "A quiet, dark electric shock." },
  { name: "Eclipse Lightning", type: "Electric", power: 110, accuracy: 70, pp: 5, category: "special", description: "Calls upon a dark storm to strike the foe." },
  // Ice/Grass
  { name: "Crystal Bloom", type: "Ice", power: 60, accuracy: 100, pp: 15, category: "special", description: "Grows sharp crystals from the ground." },
  { name: "Geode Whip", type: "Grass", power: 85, accuracy: 90, pp: 15, category: "physical", description: "Lashes out with vines covered in amethyst." },
  // Dragon/Fire
  { name: "Dark Matter Ash", type: "Dragon", power: 75, accuracy: 100, pp: 10, category: "special", description: "Smothers the enemy in inescapable cold ash." },
  { name: "Singularity Core", type: "Fire", power: 130, accuracy: 60, pp: 5, category: "special", description: "Creates a miniature burning star that collapses." },
  // Psychic/Ground
  { name: "Runic Quake", type: "Psychic", power: 70, accuracy: 100, pp: 15, category: "special", description: "Sends magical tremors through the ground." },
  { name: "Mana Fissure", type: "Ground", power: 90, accuracy: 85, pp: 10, category: "physical", description: "Cracks the earth, revealing raw magical energy." },
  // Water/Electric
  { name: "Static Splash", type: "Electric", power: 50, accuracy: 100, pp: 20, category: "special", description: "Electrifies a puddle of water under the foe." },
  { name: "Abyssal Surge", type: "Water", power: 100, accuracy: 80, pp: 10, category: "special", description: "A wave from the deepest, darkest ocean trenches." },
  // Flying/Ghost
  { name: "Chilling Breeze", type: "Flying", power: 40, accuracy: 100, pp: 25, category: "special", description: "A wind so cold it feels like a ghost passed by." },
  { name: "Phantom Zephyr", type: "Ghost", power: 85, accuracy: 95, pp: 15, category: "special", description: "An invisible gust infused with shadow energy." },
  // Grass/Fire
  { name: "Flaming Thorns", type: "Fire", power: 65, accuracy: 95, pp: 15, category: "physical", description: "Strikes with burning briar patches." },
  { name: "Forest Fire", type: "Grass", power: 110, accuracy: 75, pp: 5, category: "special", description: "Unleashes an uncontrollable blaze of nature's fury." },
  // Ice/Dragon
  { name: "Fractured Reality", type: "Dragon", power: 85, accuracy: 90, pp: 10, category: "special", description: "Shatters space like a broken mirror." },
  { name: "Glass Void", type: "Ice", power: 100, accuracy: 80, pp: 10, category: "physical", description: "Encloses the enemy in a suffocating prism." },
  // Ground/Ghost
  { name: "Grave Dirt", type: "Ground", power: 50, accuracy: 100, pp: 20, category: "physical", description: "Throws cursed soil at the enemy." },
  { name: "Tomb Collapse", type: "Ghost", power: 100, accuracy: 75, pp: 10, category: "physical", description: "Drops massive headstones from above." },
  // Electric/Psychic
  { name: "Arcane Discharge", type: "Psychic", power: 60, accuracy: 100, pp: 20, category: "special", description: "Releases built-up magical electricity." },
  { name: "Mana Lightning", type: "Electric", power: 90, accuracy: 90, pp: 15, category: "special", description: "A bolt of pure condensed spell-power." },
  // Flying/Ice
  { name: "Prismatic Swoop", type: "Flying", power: 70, accuracy: 100, pp: 15, category: "physical", description: "Dives through the air scattering blinding light." },
  { name: "Glass Gust", type: "Ice", power: 85, accuracy: 85, pp: 10, category: "special", description: "A wind carrying razor-sharp glass particles." },
  // Water/Grass
  { name: "Algae Whip", type: "Grass", power: 60, accuracy: 100, pp: 20, category: "physical", description: "Slaps the foe with wet kelp." },
  { name: "Coral Crash", type: "Water", power: 90, accuracy: 90, pp: 15, category: "physical", description: "Bashes into the enemy with a hard coral reef." },
  // Fire/Psychic
  { name: "Mystic Ember", type: "Psychic", power: 55, accuracy: 100, pp: 25, category: "special", description: "A floating flame controlled by the mind." },
  { name: "Pyro Glyph", type: "Fire", power: 95, accuracy: 85, pp: 10, category: "special", description: "Carves a burning magic circle on the enemy." },

];

const NEW_SPECIES = [
  {
    name: "Boilrox",
    description: "A small smooth stone that constantly emits hot vapor from its pores.",
    type1: "Water", type2: "Fire",
    baseHp: 50, baseAttack: 40, baseDefense: 60, baseSpeed: 30, baseSpecialAttack: 65, baseSpecialDefense: 50,
    evolutionLevel: 18, catchRate: 50, rarity: "common",
    spriteUrl: "/api/sprites/boilrox", backSpriteUrl: "/api/sprites/boilrox-back",
    moveNames: ["Steam Scald", "Tide Strike", "Ember Blast"],
  },
  {
    name: "Vaporis",
    description: "A towering elemental of thick fog that can boil oceans in an instant. Evolved from Boilrox.",
    type1: "Water", type2: "Fire",
    baseHp: 80, baseAttack: 50, baseDefense: 85, baseSpeed: 60, baseSpecialAttack: 110, baseSpecialDefense: 90,
    evolutionLevel: null, catchRate: 15, rarity: "rare",
    spriteUrl: "/api/sprites/vaporis", backSpriteUrl: "/api/sprites/vaporis-back",
    moveNames: ["Boiling Geyser", "Steam Scald", "Cascade Torrent", "Magma Surge"],
  },
  {
    name: "Gligar",
    description: "A tiny insectoid creature composed entirely of swirling sand.",
    type1: "Ground", type2: "Flying",
    baseHp: 35, baseAttack: 55, baseDefense: 40, baseSpeed: 70, baseSpecialAttack: 40, baseSpecialDefense: 35,
    evolutionLevel: 15, catchRate: 55, rarity: "common",
    spriteUrl: "/api/sprites/gligar", backSpriteUrl: "/api/sprites/gligar-back",
    moveNames: ["Grit Blast", "Stone Crush", "Gust Slash"],
  },
  {
    name: "Gliscor",
    description: "A living twister that leaves deserts in its wake. Evolved from Gligar.",
    type1: "Ground", type2: "Flying",
    baseHp: 65, baseAttack: 90, baseDefense: 65, baseSpeed: 105, baseSpecialAttack: 70, baseSpecialDefense: 55,
    evolutionLevel: null, catchRate: 20, rarity: "rare",
    spriteUrl: "/api/sprites/gliscor", backSpriteUrl: "/api/sprites/gliscor-back",
    moveNames: ["Tornado Toss", "Grit Blast", "Cyclone Dive", "Quake Slam"],
  },
  {
    name: "Rotom",
    description: "A spark of black lightning that hides in the shadows of thunderclouds.",
    type1: "Ghost", type2: "Electric",
    baseHp: 40, baseAttack: 65, baseDefense: 35, baseSpeed: 85, baseSpecialAttack: 65, baseSpecialDefense: 40,
    evolutionLevel: 22, catchRate: 40, rarity: "uncommon",
    spriteUrl: "/api/sprites/rotom", backSpriteUrl: "/api/sprites/rotom-back",
    moveNames: ["Shadow Zap", "Spark Bolt", "Shade Claw"],
  },
  {
    name: "Luxray",
    description: "An eclipse incarnate that strikes with blinding black bolts. Evolved from Rotom.",
    type1: "Electric", type2: null,
    baseHp: 65, baseAttack: 95, baseDefense: 55, baseSpeed: 110, baseSpecialAttack: 105, baseSpecialDefense: 60,
    evolutionLevel: null, catchRate: 15, rarity: "rare",
    spriteUrl: "/api/sprites/luxray", backSpriteUrl: "/api/sprites/luxray-back",
    moveNames: ["Eclipse Lightning", "Shadow Zap", "Dark Pulse", "Thunder Crash"],
  },
  {
    name: "Absol",
    description: "A tiny seedling that grows glittering gems instead of fruits.",
    type1: "Dark", type2: null,
    baseHp: 55, baseAttack: 45, baseDefense: 65, baseSpeed: 40, baseSpecialAttack: 55, baseSpecialDefense: 60,
    evolutionLevel: 19, catchRate: 45, rarity: "common",
    spriteUrl: "/api/sprites/absol", backSpriteUrl: "/api/sprites/absol-back",
    moveNames: ["Crystal Bloom", "Thorn Whip", "Crystal Shard"],
  },
  {
    name: "Abomasnow",
    description: "A thorny behemoth clad in impenetrable purple jewels. Evolved from Snover.",
    type1: "Dark", type2: null,
    baseHp: 85, baseAttack: 75, baseDefense: 105, baseSpeed: 55, baseSpecialAttack: 85, baseSpecialDefense: 90,
    evolutionLevel: null, catchRate: 20, rarity: "rare",
    spriteUrl: "/api/sprites/abomasnow", backSpriteUrl: "/api/sprites/abomasnow-back",
    moveNames: ["Geode Whip", "Crystal Bloom", "Petal Storm", "Prism Beam"],
  },
  {
    name: "Turtonator",
    description: "A paradox. A flame that absorbs light and heat rather than casting it.",
    type1: "Dragon", type2: "Fire",
    baseHp: 45, baseAttack: 70, baseDefense: 40, baseSpeed: 60, baseSpecialAttack: 80, baseSpecialDefense: 45,
    evolutionLevel: 28, catchRate: 25, rarity: "uncommon",
    spriteUrl: "/api/sprites/turtonator", backSpriteUrl: "/api/sprites/turtonator-back",
    moveNames: ["Dark Matter Ash", "Ember Blast", "Null Touch"],
  },
  {
    name: "Reshiram",
    description: "A devastating entity that consumes stars to fuel its empty heart. Evolved from Turtonator.",
    type1: "Dragon", type2: "Fire",
    baseHp: 75, baseAttack: 100, baseDefense: 65, baseSpeed: 95, baseSpecialAttack: 120, baseSpecialDefense: 75,
    evolutionLevel: null, catchRate: 5, rarity: "legendary",
    spriteUrl: "/api/sprites/reshiram", backSpriteUrl: "/api/sprites/reshiram-back",
    moveNames: ["Singularity Core", "Dark Matter Ash", "Oblivion Beam", "Inferno Wave"],
  },
  {
    name: "Baltoy",
    description: "An animated stone etched with ancient forgotten spells.",
    type1: "Psychic", type2: "Ground",
    baseHp: 50, baseAttack: 40, baseDefense: 80, baseSpeed: 25, baseSpecialAttack: 60, baseSpecialDefense: 75,
    evolutionLevel: 21, catchRate: 40, rarity: "uncommon",
    spriteUrl: "/api/sprites/baltoy", backSpriteUrl: "/api/sprites/baltoy-back",
    moveNames: ["Runic Quake", "Stone Crush", "Arcane Bolt"],
  },
  {
    name: "Claydol",
    description: "A monolithic guardian that floats effortlessly despite its immense weight. Evolved from Baltoy.",
    type1: "Psychic", type2: "Ground",
    baseHp: 85, baseAttack: 60, baseDefense: 120, baseSpeed: 40, baseSpecialAttack: 100, baseSpecialDefense: 110,
    evolutionLevel: null, catchRate: 10, rarity: "rare",
    spriteUrl: "/api/sprites/claydol", backSpriteUrl: "/api/sprites/claydol-back",
    moveNames: ["Mana Fissure", "Runic Quake", "Reality Break", "Quake Slam"],
  },
  {
    name: "Chinchou",
    description: "A translucent sea creature that delivers surprising static shocks to predators.",
    type1: "Water", type2: "Electric",
    baseHp: 60, baseAttack: 30, baseDefense: 45, baseSpeed: 65, baseSpecialAttack: 70, baseSpecialDefense: 60,
    evolutionLevel: 24, catchRate: 45, rarity: "common",
    spriteUrl: "/api/sprites/chinchou", backSpriteUrl: "/api/sprites/chinchou-back",
    moveNames: ["Static Splash", "Tide Strike", "Spark Bolt"],
  },
  {
    name: "Eelektross",
    description: "An ocean titan that can summon thunderstorms by breaching the surface. Evolved from Chinchou.",
    type1: "Electric", type2: null,
    baseHp: 100, baseAttack: 50, baseDefense: 70, baseSpeed: 85, baseSpecialAttack: 110, baseSpecialDefense: 90,
    evolutionLevel: null, catchRate: 15, rarity: "rare",
    spriteUrl: "/api/sprites/eelektross", backSpriteUrl: "/api/sprites/eelektross-back",
    moveNames: ["Abyssal Surge", "Static Splash", "Cascade Torrent", "Thunder Crash"],
  },
  {
    name: "Drifloon",
    description: "A haunting cloud of dark mist that chills anyone who walks through it.",
    type1: "Ghost", type2: "Flying",
    baseHp: 45, baseAttack: 45, baseDefense: 40, baseSpeed: 75, baseSpecialAttack: 70, baseSpecialDefense: 55,
    evolutionLevel: 23, catchRate: 35, rarity: "uncommon",
    spriteUrl: "/api/sprites/drifloon", backSpriteUrl: "/api/sprites/drifloon-back",
    moveNames: ["Chilling Breeze", "Gust Slash", "Shade Claw"],
  },
  {
    name: "Drifblim",
    description: "A terrifying spectral hurricane that drains the life of the lands it ravages. Evolved from Drifloon.",
    type1: "Ghost", type2: "Flying",
    baseHp: 75, baseAttack: 65, baseDefense: 60, baseSpeed: 115, baseSpecialAttack: 105, baseSpecialDefense: 80,
    evolutionLevel: null, catchRate: 15, rarity: "rare",
    spriteUrl: "/api/sprites/drifblim", backSpriteUrl: "/api/sprites/drifblim-back",
    moveNames: ["Phantom Zephyr", "Chilling Breeze", "Void Rip", "Cyclone Dive"],
  },
  {
    name: "Capsakid",
    description: "A smoldering perennial plant that thrives in the hottest environments.",
    type1: "Fire", type2: "Grass",
    baseHp: 55, baseAttack: 60, baseDefense: 50, baseSpeed: 45, baseSpecialAttack: 60, baseSpecialDefense: 55,
    evolutionLevel: 17, catchRate: 45, rarity: "common",
    spriteUrl: "/api/sprites/capsakid", backSpriteUrl: "/api/sprites/capsakid-back",
    moveNames: ["Flaming Thorns", "Ember Blast", "Thorn Whip"],
  },
  {
    name: "Scovillain",
    description: "A colossal burning tree that guards ancient forests with fiery rage. Evolved from Capsakid.",
    type1: "Fire", type2: "Grass",
    baseHp: 90, baseAttack: 95, baseDefense: 80, baseSpeed: 55, baseSpecialAttack: 95, baseSpecialDefense: 85,
    evolutionLevel: null, catchRate: 20, rarity: "rare",
    spriteUrl: "/api/sprites/scovillain", backSpriteUrl: "/api/sprites/scovillain-back",
    moveNames: ["Forest Fire", "Flaming Thorns", "Inferno Wave", "Root Slam"],
  },
  {
    name: "Frigibax",
    description: "A mysterious shard that seemingly absorbs reality around its edges.",
    type1: "Ice", type2: "Dragon",
    baseHp: 40, baseAttack: 65, baseDefense: 50, baseSpeed: 60, baseSpecialAttack: 65, baseSpecialDefense: 45,
    evolutionLevel: 26, catchRate: 30, rarity: "uncommon",
    spriteUrl: "/api/sprites/frigibax", backSpriteUrl: "/api/sprites/frigibax-back",
    moveNames: ["Fractured Reality", "Crystal Shard", "Null Touch"],
  },
  {
    name: "Baxcalibur",
    description: "A terrifying behemoth that traps victims in inescapable prismatic voids. Evolved from Frigibax.",
    type1: "Ice", type2: "Dragon",
    baseHp: 70, baseAttack: 110, baseDefense: 80, baseSpeed: 85, baseSpecialAttack: 110, baseSpecialDefense: 75,
    evolutionLevel: null, catchRate: 10, rarity: "rare",
    spriteUrl: "/api/sprites/baxcalibur", backSpriteUrl: "/api/sprites/baxcalibur-back",
    moveNames: ["Glass Void", "Fractured Reality", "Gem Storm", "Oblivion Beam"],
  },
  {
    name: "Golett",
    description: "A sludgy creature formed in cursed graveyards.",
    type1: "Ground", type2: "Ghost",
    baseHp: 65, baseAttack: 55, baseDefense: 70, baseSpeed: 25, baseSpecialAttack: 40, baseSpecialDefense: 60,
    evolutionLevel: 20, catchRate: 40, rarity: "common",
    spriteUrl: "/api/sprites/golett", backSpriteUrl: "/api/sprites/golett-back",
    moveNames: ["Grave Dirt", "Stone Crush", "Shade Claw"],
  },
  {
    name: "Golurk",
    description: "A walking mausoleum that fiercely protects the resting places of Elemoria. Evolved from Golett.",
    type1: "Ground", type2: "Ghost",
    baseHp: 110, baseAttack: 90, baseDefense: 115, baseSpeed: 35, baseSpecialAttack: 60, baseSpecialDefense: 95,
    evolutionLevel: null, catchRate: 15, rarity: "rare",
    spriteUrl: "/api/sprites/golurk", backSpriteUrl: "/api/sprites/golurk-back",
    moveNames: ["Tomb Collapse", "Grave Dirt", "Quake Slam", "Void Rip"],
  },
  {
    name: "Magnemite",
    description: "A crackling ball of blue arcane energy that constantly zaps its surroundings.",
    type1: "Electric", type2: "Steel",
    baseHp: 40, baseAttack: 35, baseDefense: 40, baseSpeed: 80, baseSpecialAttack: 75, baseSpecialDefense: 55,
    evolutionLevel: 22, catchRate: 35, rarity: "uncommon",
    spriteUrl: "/api/sprites/magnemite", backSpriteUrl: "/api/sprites/magnemite-back",
    moveNames: ["Arcane Discharge", "Spark Bolt", "Arcane Bolt"],
  },
  {
    name: "Magnezone",
    description: "An enlightened wizard that harnesses raw atmospheric power to cast immense spells. Evolved from Magnemite.",
    type1: "Electric", type2: "Steel",
    baseHp: 70, baseAttack: 55, baseDefense: 65, baseSpeed: 105, baseSpecialAttack: 125, baseSpecialDefense: 85,
    evolutionLevel: null, catchRate: 15, rarity: "rare",
    spriteUrl: "/api/sprites/magnezone", backSpriteUrl: "/api/sprites/magnezone-back",
    moveNames: ["Mana Lightning", "Arcane Discharge", "Thunder Crash", "Reality Break"],
  },
  {
    name: "Delibird",
    description: "A delicate bird with wings made of incredibly sharp, transparent crystal.",
    type1: "Flying", type2: "Ice",
    baseHp: 40, baseAttack: 60, baseDefense: 35, baseSpeed: 95, baseSpecialAttack: 60, baseSpecialDefense: 40,
    evolutionLevel: 21, catchRate: 50, rarity: "common",
    spriteUrl: "/api/sprites/delibird", backSpriteUrl: "/api/sprites/delibird-back",
    moveNames: ["Prismatic Swoop", "Gust Slash", "Crystal Shard"],
  },
  {
    name: "Articuno",
    description: "A fierce raptor covered in gem-like armor that reflects blinding light. Evolved from Delibird.",
    type1: "Flying", type2: "Ice",
    baseHp: 70, baseAttack: 100, baseDefense: 60, baseSpeed: 125, baseSpecialAttack: 90, baseSpecialDefense: 65,
    evolutionLevel: null, catchRate: 20, rarity: "rare",
    spriteUrl: "/api/sprites/articuno", backSpriteUrl: "/api/sprites/articuno-back",
    moveNames: ["Glass Gust", "Prismatic Swoop", "Cyclone Dive", "Prism Beam"],
  },
  {
    name: "Lotad",
    description: "A small bundle of animate algae that uses the ocean currents to travel.",
    type1: "Water", type2: "Grass",
    baseHp: 55, baseAttack: 45, baseDefense: 65, baseSpeed: 45, baseSpecialAttack: 50, baseSpecialDefense: 70,
    evolutionLevel: 19, catchRate: 55, rarity: "common",
    spriteUrl: "/api/sprites/lotad", backSpriteUrl: "/api/sprites/lotad-back",
    moveNames: ["Algae Whip", "Tide Strike", "Thorn Whip"],
  },
  {
    name: "Ludicolo",
    description: "A massive creature made entirely of ancient, hardened coral reefs. Evolved from Lotad.",
    type1: "Water", type2: "Grass",
    baseHp: 95, baseAttack: 85, baseDefense: 110, baseSpeed: 50, baseSpecialAttack: 75, baseSpecialDefense: 105,
    evolutionLevel: null, catchRate: 20, rarity: "rare",
    spriteUrl: "/api/sprites/ludicolo", backSpriteUrl: "/api/sprites/ludicolo-back",
    moveNames: ["Coral Crash", "Algae Whip", "Cascade Torrent", "Petal Storm"],
  },
  {
    name: "Braixen",
    description: "A living candle that learns and recites ancient pyromancy incantations.",
    type1: "Fire", type2: "Psychic",
    baseHp: 45, baseAttack: 35, baseDefense: 45, baseSpeed: 60, baseSpecialAttack: 75, baseSpecialDefense: 60,
    evolutionLevel: 23, catchRate: 35, rarity: "uncommon",
    spriteUrl: "/api/sprites/braixen", backSpriteUrl: "/api/sprites/braixen-back",
    moveNames: ["Mystic Ember", "Ember Blast", "Arcane Bolt"],
  },
  {
    name: "Delphox",
    description: "A master warlock entirely consumed by magical fire. Leaves trails of glowing ash. Evolved from Braixen.",
    type1: "Fire", type2: "Psychic",
    baseHp: 75, baseAttack: 55, baseDefense: 70, baseSpeed: 90, baseSpecialAttack: 130, baseSpecialDefense: 90,
    evolutionLevel: null, catchRate: 15, rarity: "rare",
    spriteUrl: "/api/sprites/delphox", backSpriteUrl: "/api/sprites/delphox-back",
    moveNames: ["Pyro Glyph", "Mystic Ember", "Magma Surge", "Reality Break"],
  },

];

export async function expand() {
  console.log("Starting Pokemon expansion...");

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
    { name: "Vaporis", evolvesFrom: "Boilrox" },
    { name: "Gliscor", evolvesFrom: "Gligar" },
    { name: "Luxray", evolvesFrom: "Rotom" },
    
    { name: "Reshiram", evolvesFrom: "Turtonator" },
    { name: "Claydol", evolvesFrom: "Baltoy" },
    { name: "Eelektross", evolvesFrom: "Chinchou" },
    { name: "Drifblim", evolvesFrom: "Drifloon" },
    { name: "Scovillain", evolvesFrom: "Capsakid" },
    { name: "Baxcalibur", evolvesFrom: "Frigibax" },
    { name: "Golurk", evolvesFrom: "Golett" },
    { name: "Magnezone", evolvesFrom: "Magnemite" },
    { name: "Articuno", evolvesFrom: "Delibird" },
    { name: "Ludicolo", evolvesFrom: "Lotad" },
    { name: "Delphox", evolvesFrom: "Braixen" },
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
    "Emberveil Meadows": ["Boilrox", "Capsakid", "Gligar"],
    "Aqua Labyrinth": ["Chinchou", "Lotad", "Boilrox"],
    "Thornwood Depths": ["Absol", "Golett", "Delibird"],
    "Storm Peaks": ["Rotom", "Gligar", "Braixen"],
    "Shadow Sanctum": ["Drifloon", "Golett", "Baltoy"],
    "Void Rift": ["Turtonator", "Frigibax", "Magnemite"],
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

  console.log("Expansion successfully injected into db.");
}

expand()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
