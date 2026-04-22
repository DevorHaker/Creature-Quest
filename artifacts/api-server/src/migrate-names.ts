import { db } from "@workspace/db";
import { pokemonSpeciesTable, regionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const nameMapping: Record<string, string> = {
  "Ignaryx": "Charmander",
  "Pyroveil": "Chandelure",
  "Aquorin": "Squirtle",
  "Tidewrath": "Lanturn",
  "Verdling": "Chikorita",
  "Sylvathon": "Torterra",
  "Voltrik": "Pichu",
  "Stormvex": "Zapdos",
  "Gloomoth": "Misdreavus",
  "Umbrazen": "Giratina",
  "Crystalite": "Snorunt",
  "Prismaryx": "Jynx",
  "Aerith": "Swablu",
  "Tempestix": "Emolga",
  "Terradon": "Sandshrew",
  "Magnarock": "Camerupt",
  "Arcanling": "Abra",
  "Runelord": "Mr. Mime",
  "Voidlet": "Dratini",
  "Nihilyx": "Dragapult",

  "Dustmite": "Gligar",
  "Sandstorm": "Gliscor",
  "Voltshade": "Rotom",
  "Nightspark": "Luxray",
  "Gemsprout": "Snover",
  "Amethorn": "Abomasnow",
  "Nullflare": "Turtonator",
  "Voidblaze": "Reshiram",
  "Runepebble": "Baltoy",
  "Mysticolith": "Claydol",
  "Jellyshock": "Chinchou",
  "Leviathrum": "Eelektross",
  "Gloomdrift": "Drifloon",
  "Wraithwind": "Drifblim",
  "Burnbush": "Capsakid",
  "Charwood": "Scovillain",
  "Shardo": "Frigibax",
  "Prismasmash": "Baxcalibur",
  "Mudghoul": "Golett",
  "Tombstone": "Golurk",
  "Manaspark": "Magnemite",
  "Archvolt": "Magnezone",
  "Glasswing": "Delibird",
  "Shardtalon": "Articuno",
  "Kelplet": "Lotad",
  "Reefguardian": "Ludicolo",
  "Spellflame": "Braixen",
  "Infernus": "Delphox",
  
  "Cinderwing": "Fletchinder",
  "Blazeraptor": "Talonflame",
  "Opalfin": "Spheal",
  "Crystacean": "Walrein",
  "Nightspore": "Phantump",
  "Deathcap": "Trevenant",
  "Staticrift": "Dracozolt",
  "Nullsurge": "Zekrom",
  "Clayrune": "Sandile",
  "Golemancer": "Krookodile",
};

// Also apply type updates for the conflict resolution changes
const typeUpdates: Record<string, { type1: string, type2: string | null }> = {
  "Nightspark": { type1: "Electric", type2: null }, // Luxray
  "Leviathrum": { type1: "Electric", type2: null }, // Eelektross
  "Manaspark": { type1: "Electric", type2: "Steel" }, // Magnemite
  "Archvolt": { type1: "Electric", type2: "Steel" }, // Magnezone
  "Clayrune": { type1: "Ground", type2: "Dark" }, // Sandile
  "Golemancer": { type1: "Ground", type2: "Dark" }, // Krookodile
};

async function migrateNames() {
  console.log("Starting name migration...");

  const species = await db.select().from(pokemonSpeciesTable);
  for (const s of species) {
    let newName = nameMapping[s.name];
    if (newName && newName !== s.name) {
      let typesToUpdate = typeUpdates[s.name] || {};
      
      await db.update(pokemonSpeciesTable).set({ 
        name: newName, 
        spriteUrl: `/api/sprites/${newName.toLowerCase().replace(' ', '-')}`,
        backSpriteUrl: `/api/sprites/${newName.toLowerCase().replace(' ', '-')}-back`,
        ...typesToUpdate
      }).where(eq(pokemonSpeciesTable.id, s.id));
      console.log(`Updated Species ${s.name} -> ${newName}`);
    }
  }

  console.log("Name migration completed!");
  process.exit(0);
}

migrateNames().catch(console.error);
