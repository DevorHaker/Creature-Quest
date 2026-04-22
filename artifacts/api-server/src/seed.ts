import { db } from "@workspace/db";
import {
  movesTable,
  pokemonSpeciesTable,
  regionsTable,
} from "@workspace/db";
import { eq, inArray } from "drizzle-orm";

const MOVES = [
  // Fire moves
  { name: "Ember", type: "Fire", power: 40, accuracy: 100, pp: 25, category: "special", description: "The target is attacked with small flames. This may also leave the target with a burn." },
  { name: "Flamethrower", type: "Fire", power: 90, accuracy: 100, pp: 15, category: "special", description: "The target is scorched with an intense blast of fire. This may also leave the target with a burn." },
  { name: "Fire Blast", type: "Fire", power: 110, accuracy: 85, pp: 5, category: "special", description: "The target is attacked with an intense blast of all-consuming fire. This may also leave the target with a burn." },
  { name: "Fire Punch", type: "Fire", power: 75, accuracy: 100, pp: 15, category: "physical", description: "The target is punched with a fiery fist. This may also leave the target with a burn." },
  // Water moves
  { name: "Water Gun", type: "Water", power: 40, accuracy: 100, pp: 25, category: "special", description: "The target is blasted with a forceful shot of water." },
  { name: "Water Pulse", type: "Water", power: 60, accuracy: 100, pp: 20, category: "special", description: "The target is attacked with a pulsing blast of water. This may also confuse the target." },
  { name: "Surf", type: "Water", power: 90, accuracy: 100, pp: 15, category: "special", description: "The user attacks everything around it by swamping its surroundings with a giant wave." },
  { name: "Hydro Pump", type: "Water", power: 110, accuracy: 80, pp: 5, category: "special", description: "The target is blasted by a huge volume of water launched under great pressure." },
  // Grass moves
  { name: "Vine Whip", type: "Grass", power: 45, accuracy: 100, pp: 25, category: "physical", description: "The target is struck with slender, whiplike vines to inflict damage." },
  { name: "Razor Leaf", type: "Grass", power: 55, accuracy: 95, pp: 25, category: "physical", description: "Sharp-edged leaves are launched to slash at the opposing Pokemon. Critical hits land more easily." },
  { name: "Energy Ball", type: "Grass", power: 90, accuracy: 100, pp: 10, category: "special", description: "The user draws power from nature and fires it at the target. This may also lower the target's Sp. Def stat." },
  { name: "Solar Beam", type: "Grass", power: 120, accuracy: 100, pp: 10, category: "special", description: "In this two-turn attack, the user gathers light, then blasts a bundled beam on the next turn." },
  // Electric moves
  { name: "Thunder Shock", type: "Electric", power: 40, accuracy: 100, pp: 30, category: "special", description: "A jolt of electricity crashes down on the target to inflict damage. This may also leave the target with paralysis." },
  { name: "Thunderbolt", type: "Electric", power: 90, accuracy: 100, pp: 15, category: "special", description: "A strong electric blast crashes down on the target. This may also leave the target with paralysis." },
  { name: "Thunder", type: "Electric", power: 110, accuracy: 70, pp: 10, category: "special", description: "A wicked thunderbolt is dropped on the target to inflict damage. This may also leave the target with paralysis." },
  { name: "Spark", type: "Electric", power: 65, accuracy: 100, pp: 20, category: "physical", description: "The user throws an electrically charged tackle at the target. This may also leave the target with paralysis." },
  // Ground moves
  { name: "Mud-Slap", type: "Ground", power: 20, accuracy: 100, pp: 10, category: "special", description: "The user hurls mud in the target's face to inflict damage and lower its accuracy." },
  { name: "Earthquake", type: "Ground", power: 100, accuracy: 100, pp: 10, category: "physical", description: "The user sets off an earthquake that strikes every Pokemon around it." },
  { name: "Sand Tomb", type: "Ground", power: 35, accuracy: 85, pp: 15, category: "physical", description: "The user traps the target inside a harshly raging sandstorm for four to five turns." },
  // Flying moves
  { name: "Gust", type: "Flying", power: 40, accuracy: 100, pp: 35, category: "special", description: "A gust of wind is whipped up by wings and launched at the target to inflict damage." },
  { name: "Air Slash", type: "Flying", power: 75, accuracy: 95, pp: 15, category: "special", description: "The user attacks with a blade of air that slices even the sky. This may also make the target flinch." },
  { name: "Hurricane", type: "Flying", power: 110, accuracy: 70, pp: 10, category: "special", description: "The user wraps its opponent in a fierce wind that flies up into the sky. This may also confuse the target." },
  // Ghost moves
  { name: "Lick", type: "Ghost", power: 30, accuracy: 100, pp: 30, category: "physical", description: "The target is licked with a long tongue, causing damage. This may also leave the target with paralysis." },
  { name: "Shadow Ball", type: "Ghost", power: 80, accuracy: 100, pp: 15, category: "special", description: "The user hurls a shadowy blob at the target. This may also lower the target's Sp. Def stat." },
  { name: "Shadow Claw", type: "Ghost", power: 70, accuracy: 100, pp: 15, category: "physical", description: "The user slashes with a sharp claw made from shadows. Critical hits land more easily." },
  // Ice moves
  { name: "Ice Shard", type: "Ice", power: 40, accuracy: 100, pp: 30, category: "physical", description: "The user flash-freezes chunks of ice and hurls them at the target. This move always goes first." },
  { name: "Ice Beam", type: "Ice", power: 90, accuracy: 100, pp: 10, category: "special", description: "The target is struck with an icy-cold beam of energy. This may also leave the target frozen." },
  { name: "Blizzard", type: "Ice", power: 110, accuracy: 70, pp: 5, category: "special", description: "A howling blizzard is summoned to strike opposing Pokemon. This may also leave the opposing Pokemon frozen." },
  // Psychic moves
  { name: "Confusion", type: "Psychic", power: 50, accuracy: 100, pp: 25, category: "special", description: "The target is hit by a weak telekinetic force. This may also confuse the target." },
  { name: "Psychic", type: "Psychic", power: 90, accuracy: 100, pp: 10, category: "special", description: "The target is hit by a strong telekinetic force. This may also lower the target's Sp. Def stat." },
  { name: "Zen Headbutt", type: "Psychic", power: 80, accuracy: 90, pp: 15, category: "physical", description: "The user focuses its willpower to its head and attacks the target. This may also make the target flinch." },
  // Dragon moves
  { name: "Dragon Breath", type: "Dragon", power: 60, accuracy: 100, pp: 20, category: "special", description: "The user exhales a mighty gust that inflicts damage. This may also leave the target with paralysis." },
  { name: "Dragon Claw", type: "Dragon", power: 80, accuracy: 100, pp: 15, category: "physical", description: "The user slashes the target with huge, sharp claws." },
  { name: "Outrage", type: "Dragon", power: 120, accuracy: 100, pp: 10, category: "physical", description: "The user rampages and attacks for two to three turns. The user then becomes confused." },
  // Normal moves
  { name: "Tackle", type: "Normal", power: 40, accuracy: 100, pp: 35, category: "physical", description: "A physical attack in which the user charges and slams into the target with its whole body." },
  { name: "Scratch", type: "Normal", power: 40, accuracy: 100, pp: 35, category: "physical", description: "Hard, pointed claws slash the target to inflict damage." },
];

const SPECIES = [
  // Starters
  {
    name: "Charmander",
    description: "It has a preference for hot things. When it rains, steam is said to spout from the tip of its tail.",
    type1: "Fire", type2: null,
    baseHp: 39, baseAttack: 52, baseDefense: 43, baseSpeed: 65, baseSpecialAttack: 60, baseSpecialDefense: 50,
    evolutionLevel: 16, catchRate: 45, rarity: "uncommon",
    spriteUrl: "/api/sprites/charmander", backSpriteUrl: "/api/sprites/charmander-back",
    moveNames: ["Ember", "Scratch", "Fire Spin", "Fire Punch"],
  },
  {
    name: "Charmeleon",
    description: "It has a barbaric nature. In battle, it whips its fiery tail around and slashes away with sharp claws.",
    type1: "Fire", type2: null,
    baseHp: 58, baseAttack: 64, baseDefense: 58, baseSpeed: 80, baseSpecialAttack: 80, baseSpecialDefense: 65,
    evolutionLevel: 36, catchRate: 45, rarity: "uncommon",
    spriteUrl: "/api/sprites/charmeleon", backSpriteUrl: "/api/sprites/charmeleon-back",
    moveNames: ["Flamethrower", "Fire Spin", "Scratch", "Fire Punch"],
  },
  {
    name: "Charizard",
    description: "It spits fire that is hot enough to melt boulders. It may cause forest fires by blowing flames.",
    type1: "Fire", type2: "Flying",
    baseHp: 78, baseAttack: 84, baseDefense: 78, baseSpeed: 100, baseSpecialAttack: 109, baseSpecialDefense: 85,
    evolutionLevel: null, catchRate: 45, rarity: "rare",
    spriteUrl: "/api/sprites/charizard", backSpriteUrl: "/api/sprites/charizard-back",
    moveNames: ["Fire Blast", "Flamethrower", "Air Slash", "Hurricane"],
  },
  {
    name: "Squirtle",
    description: "When it retracts its long neck into its shell, it squirts out water with vigorous force.",
    type1: "Water", type2: null,
    baseHp: 44, baseAttack: 48, baseDefense: 65, baseSpeed: 43, baseSpecialAttack: 50, baseSpecialDefense: 64,
    evolutionLevel: 16, catchRate: 45, rarity: "uncommon",
    spriteUrl: "/api/sprites/squirtle", backSpriteUrl: "/api/sprites/squirtle-back",
    moveNames: ["Water Gun", "Tackle", "Water Pulse", "Surf"],
  },
  {
    name: "Wartortle",
    description: "It is recognized as a symbol of longevity. If its shell has algae on it, that Wartortle is very old.",
    type1: "Water", type2: null,
    baseHp: 59, baseAttack: 63, baseDefense: 80, baseSpeed: 58, baseSpecialAttack: 65, baseSpecialDefense: 80,
    evolutionLevel: 36, catchRate: 45, rarity: "uncommon",
    spriteUrl: "/api/sprites/wartortle", backSpriteUrl: "/api/sprites/wartortle-back",
    moveNames: ["Water Pulse", "Surf", "Tackle", "Water Gun"],
  },
  {
    name: "Blastoise",
    description: "It crushes its foe under its heavy body to cause fainting. In a pinch, it will withdraw inside its shell.",
    type1: "Water", type2: null,
    baseHp: 79, baseAttack: 83, baseDefense: 100, baseSpeed: 78, baseSpecialAttack: 85, baseSpecialDefense: 105,
    evolutionLevel: null, catchRate: 45, rarity: "rare",
    spriteUrl: "/api/sprites/blastoise", backSpriteUrl: "/api/sprites/blastoise-back",
    moveNames: ["Hydro Pump", "Surf", "Water Pulse", "Tackle"],
  },
  {
    name: "Chikorita",
    description: "A sweet aroma gently wafts from the leaf on its head. It is docile and loves to soak up sunbeams.",
    type1: "Grass", type2: null,
    baseHp: 45, baseAttack: 49, baseDefense: 65, baseSpeed: 45, baseSpecialAttack: 49, baseSpecialDefense: 65,
    evolutionLevel: 16, catchRate: 45, rarity: "uncommon",
    spriteUrl: "/api/sprites/chikorita", backSpriteUrl: "/api/sprites/chikorita-back",
    moveNames: ["Vine Whip", "Tackle", "Razor Leaf", "Energy Ball"],
  },
  {
    name: "Bayleef",
    description: "A spicy aroma wafts from around its neck. The fragrance has a restorative effect, but it can also stimulate a desire to fight.",
    type1: "Grass", type2: null,
    baseHp: 60, baseAttack: 62, baseDefense: 80, baseSpeed: 60, baseSpecialAttack: 63, baseSpecialDefense: 80,
    evolutionLevel: 32, catchRate: 45, rarity: "uncommon",
    spriteUrl: "/api/sprites/bayleef", backSpriteUrl: "/api/sprites/bayleef-back",
    moveNames: ["Razor Leaf", "Vine Whip", "Energy Ball", "Tackle"],
  },
  {
    name: "Meganium",
    description: "The aroma that rises from its petals contains a substance that calms aggressive feelings.",
    type1: "Grass", type2: null,
    baseHp: 80, baseAttack: 82, baseDefense: 100, baseSpeed: 80, baseSpecialAttack: 83, baseSpecialDefense: 100,
    evolutionLevel: null, catchRate: 45, rarity: "rare",
    spriteUrl: "/api/sprites/meganium", backSpriteUrl: "/api/sprites/meganium-back",
    moveNames: ["Solar Beam", "Razor Leaf", "Energy Ball", "Vine Whip"],
  },
  {
    name: "Pichu",
    description: "It is not yet skilled at storing electricity. It may send out a jolt if amused or startled.",
    type1: "Electric", type2: null,
    baseHp: 20, baseAttack: 40, baseDefense: 15, baseSpeed: 60, baseSpecialAttack: 35, baseSpecialDefense: 35,
    evolutionLevel: 13, catchRate: 190, rarity: "uncommon",
    spriteUrl: "/api/sprites/pichu", backSpriteUrl: "/api/sprites/pichu-back",
    moveNames: ["Thunder Shock", "Spark", "Tackle", "Thunderbolt"],
  },
  {
    name: "Pikachu",
    description: "Pikachu that can generate powerful electricity have cheek sacs that are extra soft and super stretchy.",
    type1: "Electric", type2: null,
    baseHp: 35, baseAttack: 55, baseDefense: 40, baseSpeed: 90, baseSpecialAttack: 50, baseSpecialDefense: 50,
    evolutionLevel: 30, catchRate: 190, rarity: "uncommon",
    spriteUrl: "/api/sprites/pikachu", backSpriteUrl: "/api/sprites/pikachu-back",
    moveNames: ["Thunderbolt", "Spark", "Thunder Shock", "Tackle"],
  },
  {
    name: "Raichu",
    description: "Its long tail serves as a ground to protect itself from its own high-voltage power.",
    type1: "Electric", type2: null,
    baseHp: 60, baseAttack: 90, baseDefense: 55, baseSpeed: 110, baseSpecialAttack: 90, baseSpecialDefense: 80,
    evolutionLevel: null, catchRate: 75, rarity: "rare",
    spriteUrl: "/api/sprites/raichu", backSpriteUrl: "/api/sprites/raichu-back",
    moveNames: ["Thunder", "Thunderbolt", "Spark", "Thunder Shock"],
  },
  {
    name: "Misdreavus",
    description: "It loves to bite and yank people's hair from behind without warning, just to see their shocked reactions.",
    type1: "Ghost", type2: null,
    baseHp: 60, baseAttack: 60, baseDefense: 60, baseSpeed: 85, baseSpecialAttack: 85, baseSpecialDefense: 85,
    evolutionLevel: 35, catchRate: 45, rarity: "uncommon",
    spriteUrl: "/api/sprites/misdreavus", backSpriteUrl: "/api/sprites/misdreavus-back",
    moveNames: ["Shadow Ball", "Lick", "Confusion", "Shadow Claw"],
  },
  {
    name: "Mismagius",
    description: "Its chants can make those who hear them suffer from headaches and hallucinations.",
    type1: "Ghost", type2: null,
    baseHp: 60, baseAttack: 60, baseDefense: 60, baseSpeed: 105, baseSpecialAttack: 105, baseSpecialDefense: 105,
    evolutionLevel: null, catchRate: 45, rarity: "rare",
    spriteUrl: "/api/sprites/mismagius", backSpriteUrl: "/api/sprites/mismagius-back",
    moveNames: ["Shadow Ball", "Psychic", "Shadow Claw", "Confusion"],
  },
  {
    name: "Snorunt",
    description: "It is said that several Snorunt gather under giant leaves and live together in harmony.",
    type1: "Ice", type2: null,
    baseHp: 50, baseAttack: 50, baseDefense: 50, baseSpeed: 50, baseSpecialAttack: 50, baseSpecialDefense: 50,
    evolutionLevel: 42, catchRate: 190, rarity: "common",
    spriteUrl: "/api/sprites/snorunt", backSpriteUrl: "/api/sprites/snorunt-back",
    moveNames: ["Ice Shard", "Powder Snow", "Ice Beam", "Tackle"],
  },
  {
    name: "Glalie",
    description: "It has a body made of rock, which it covers with an armor of ice. It freezes its foes with icy breath.",
    type1: "Ice", type2: null,
    baseHp: 80, baseAttack: 80, baseDefense: 80, baseSpeed: 80, baseSpecialAttack: 80, baseSpecialDefense: 80,
    evolutionLevel: null, catchRate: 75, rarity: "rare",
    spriteUrl: "/api/sprites/glalie", backSpriteUrl: "/api/sprites/glalie-back",
    moveNames: ["Ice Beam", "Blizzard", "Ice Shard", "Powder Snow"],
  },
  {
    name: "Swablu",
    description: "It constantly prances and cleans its wings. It uses its bill to smooth out its feathers.",
    type1: "Normal", type2: "Flying",
    baseHp: 45, baseAttack: 40, baseDefense: 60, baseSpeed: 50, baseSpecialAttack: 40, baseSpecialDefense: 75,
    evolutionLevel: 35, catchRate: 255, rarity: "common",
    spriteUrl: "/api/sprites/swablu", backSpriteUrl: "/api/sprites/swablu-back",
    moveNames: ["Gust", "Tackle", "Air Slash", "Hurricane"],
  },
  {
    name: "Altaria",
    description: "If it hears a beautiful melody, it will hum along with a soprano voice.",
    type1: "Dragon", type2: "Flying",
    baseHp: 75, baseAttack: 70, baseDefense: 90, baseSpeed: 80, baseSpecialAttack: 70, baseSpecialDefense: 105,
    evolutionLevel: null, catchRate: 45, rarity: "rare",
    spriteUrl: "/api/sprites/altaria", backSpriteUrl: "/api/sprites/altaria-back",
    moveNames: ["Dragon Breath", "Dragon Pulse", "Sky Attack", "Hurricane"],
  },
  {
    name: "Sandshrew",
    description: "It loves to bathe in the grit of dry, sandy areas. It curls into a ball to protect itself.",
    type1: "Ground", type2: null,
    baseHp: 50, baseAttack: 75, baseDefense: 85, baseSpeed: 40, baseSpecialAttack: 20, baseSpecialDefense: 30,
    evolutionLevel: 22, catchRate: 255, rarity: "common",
    spriteUrl: "/api/sprites/sandshrew", backSpriteUrl: "/api/sprites/sandshrew-back",
    moveNames: ["Mud-Slap", "Scratch", "Earthquake", "Sand Tomb"],
  },
  {
    name: "Sandslash",
    description: "It is adept at using its sharp claws to burrow into the ground and hide.",
    type1: "Ground", type2: null,
    baseHp: 75, baseAttack: 100, baseDefense: 110, baseSpeed: 65, baseSpecialAttack: 45, baseSpecialDefense: 55,
    evolutionLevel: null, catchRate: 90, rarity: "rare",
    spriteUrl: "/api/sprites/sandslash", backSpriteUrl: "/api/sprites/sandslash-back",
    moveNames: ["Earthquake", "Sand Tomb", "Scratch", "Mud-Slap"],
  },
  {
    name: "Abra",
    description: "It sleeps 18 hours a day. It uses telepathy to sense danger even while asleep.",
    type1: "Psychic", type2: null,
    baseHp: 25, baseAttack: 20, baseDefense: 15, baseSpeed: 90, baseSpecialAttack: 105, baseSpecialDefense: 55,
    evolutionLevel: 16, catchRate: 200, rarity: "uncommon",
    spriteUrl: "/api/sprites/abra", backSpriteUrl: "/api/sprites/abra-back",
    moveNames: ["Confusion", "Zen Headbutt", "Psychic", "Tackle"],
  },
  {
    name: "Kadabra",
    description: "It possesses strong mental power. The more danger it faces, the stronger its psychic power becomes.",
    type1: "Psychic", type2: null,
    baseHp: 40, baseAttack: 35, baseDefense: 30, baseSpeed: 105, baseSpecialAttack: 120, baseSpecialDefense: 70,
    evolutionLevel: 36, catchRate: 100, rarity: "uncommon",
    spriteUrl: "/api/sprites/kadabra", backSpriteUrl: "/api/sprites/kadabra-back",
    moveNames: ["Psychic", "Confusion", "Zen Headbutt", "Tackle"],
  },
  {
    name: "Alakazam",
    description: "It has an IQ of 5,000. It can remember everything that has happened in the world since the day it was born.",
    type1: "Psychic", type2: null,
    baseHp: 55, baseAttack: 50, baseDefense: 45, baseSpeed: 120, baseSpecialAttack: 135, baseSpecialDefense: 95,
    evolutionLevel: null, catchRate: 50, rarity: "rare",
    spriteUrl: "/api/sprites/alakazam", backSpriteUrl: "/api/sprites/alakazam-back",
    moveNames: ["Psychic", "Zen Headbutt", "Shadow Ball", "Confusion"],
  },
  {
    name: "Dratini",
    description: "It lives in water that reaches great depths. It is said to have many mysterious powers.",
    type1: "Dragon", type2: null,
    baseHp: 41, baseAttack: 64, baseDefense: 45, baseSpeed: 50, baseSpecialAttack: 50, baseSpecialDefense: 50,
    evolutionLevel: 30, catchRate: 45, rarity: "rare",
    spriteUrl: "/api/sprites/dratini", backSpriteUrl: "/api/sprites/dratini-back",
    moveNames: ["Dragon Breath", "Tackle", "Dragon Pulse", "Dragon Claw"],
  },
  {
    name: "Dragonair",
    description: "It can change the weather in its vicinity by discharging lightning from its crystal orbs.",
    type1: "Dragon", type2: null,
    baseHp: 61, baseAttack: 84, baseDefense: 65, baseSpeed: 70, baseSpecialAttack: 70, baseSpecialDefense: 70,
    evolutionLevel: 55, catchRate: 45, rarity: "rare",
    spriteUrl: "/api/sprites/dragonair", backSpriteUrl: "/api/sprites/dragonair-back",
    moveNames: ["Dragon Pulse", "Dragon Breath", "Dragon Claw", "Thunderbolt"],
  },
  {
    name: "Dragonite",
    description: "It is a kindhearted Pokemon that leads lost and foundering ships in a storm to the safety of land.",
    type1: "Dragon", type2: "Flying",
    baseHp: 91, baseAttack: 134, baseDefense: 95, baseSpeed: 80, baseSpecialAttack: 100, baseSpecialDefense: 100,
    evolutionLevel: null, catchRate: 45, rarity: "legendary",
    spriteUrl: "/api/sprites/dragonite", backSpriteUrl: "/api/sprites/dragonite-back",
    moveNames: ["Outrage", "Dragon Claw", "Hurricane", "Fire Blast"],
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

  // Check if starters exist
  const starters = await db.select().from(pokemonSpeciesTable).where(inArray(pokemonSpeciesTable.name, ["Charmander", "Squirtle", "Chikorita"]));
  if (starters.length === 3) {
    console.log("Starters already exist, skipping main seed.");
    return;
  }

  // Insert moves
  console.log("Seeding moves...");
  const insertedMoves = await db.insert(movesTable).values(MOVES).returning();
  const moveMap = new Map(insertedMoves.map((m: any) => [m.name, m.id]));

  // Insert species
  console.log("Seeding species...");
  const evolutionLinks: Array<{ name: string; evolvesFrom: string }> = [
    { name: "Charmeleon", evolvesFrom: "Charmander" },
    { name: "Charizard", evolvesFrom: "Charmeleon" },
    { name: "Wartortle", evolvesFrom: "Squirtle" },
    { name: "Blastoise", evolvesFrom: "Wartortle" },
    { name: "Bayleef", evolvesFrom: "Chikorita" },
    { name: "Meganium", evolvesFrom: "Bayleef" },
    { name: "Pikachu", evolvesFrom: "Pichu" },
    { name: "Raichu", evolvesFrom: "Pikachu" },
    { name: "Mismagius", evolvesFrom: "Misdreavus" },
    { name: "Glalie", evolvesFrom: "Snorunt" },
    { name: "Altaria", evolvesFrom: "Swablu" },
    { name: "Sandslash", evolvesFrom: "Sandshrew" },
    { name: "Kadabra", evolvesFrom: "Abra" },
    { name: "Alakazam", evolvesFrom: "Kadabra" },
    { name: "Dragonair", evolvesFrom: "Dratini" },
    { name: "Dragonite", evolvesFrom: "Dragonair" },
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

  const insertedSpecies = await db.insert(pokemonSpeciesTable).values(speciesInserts).returning();
  const speciesMap = new Map(insertedSpecies.map((s: any) => [s.name, s.id]));

  // Update evolution links
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

  // Insert regions with correct wild Pokemon species
  console.log("Seeding regions...");
  const regionSpeciesMap: Record<string, string[]> = {
    "Emberveil Meadows": ["Charmander", "Chikorita", "Pikachu", "Snorunt"],
    "Aqua Labyrinth": ["Squirtle", "Pichu", "Wartortle", "Swablu"],
    "Thornwood Depths": ["Bayleef", "Misdreavus", "Sandshrew", "Chikorita"],
    "Storm Peaks": ["Raichu", "Altaria", "Pikachu", "Abra"],
    "Shadow Sanctum": ["Misdreavus", "Mismagius", "Dratini", "Kadabra"],
    "Void Rift": ["Dragonite", "Alakazam", "Charizard", "Dragonair"],
  };

  const regionInserts = REGIONS.map((r) => ({
    ...r,
    wildPokemonSpeciesIds: (regionSpeciesMap[r.name] ?? []).map((name) => speciesMap.get(name) ?? 1),
  }));

  await db.insert(regionsTable).values(regionInserts);

  console.log("Seed completed!");
}
