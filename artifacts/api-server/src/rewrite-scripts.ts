import fs from "fs";
import path from "path";

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

const typeUpdates: Record<string, { type1: string, type2: string | null }> = {
  "Luxray": { type1: `"Electric"`, type2: `null` },
  "Eelektross": { type1: `"Electric"`, type2: `null` },
  "Magnemite": { type1: `"Electric"`, type2: `"Steel"` },
  "Magnezone": { type1: `"Electric"`, type2: `"Steel"` },
  "Sandile": { type1: `"Ground"`, type2: `"Dark"` },
  "Krookodile": { type1: `"Ground"`, type2: `"Dark"` },
};

function processFile(filePath: string) {
  let content = fs.readFileSync(filePath, "utf-8");

  // First do the name replacements
  for (const [oldName, newName] of Object.entries(nameMapping)) {
    // Replace names in quotes "Ignaryx" -> "Charmander"
    content = content.replace(new RegExp(`"${oldName}"`, 'g'), `"${newName}"`);
    // Replace names in URLs /api/sprites/ignaryx -> /api/sprites/charmander
    content = content.replace(new RegExp(`/api/sprites/${oldName.toLowerCase()}`, 'g'), `/api/sprites/${newName.toLowerCase().replace(' ', '-')}`);
    // Replace names in strings without quotes (like descriptions)
    content = content.replace(new RegExp(`${oldName}\\.`, 'g'), `${newName}.`);
    content = content.replace(new RegExp(`${oldName}`, 'g'), `${newName}`);
  }

  // Then do the type correction replacements
  for (const [name, types] of Object.entries(typeUpdates)) {
    // Find the block for this name and update types
    const regex = new RegExp(`name:\\s*"${name}"[\\s\\S]*?type1:\\s*"[^"]*",\\s*type2:\\s*[^,]+,`, "g");
    content = content.replace(regex, (match) => {
      return match.replace(/type1:\s*"[^"]*",\s*type2:\s*[^,]+,/, `type1: ${types.type1}, type2: ${types.type2},`);
    });
  }

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`Processed ${filePath}`);
}

const basePath = path.join("e:", "Pokemon_Game", "Creature-Quest", "artifacts");
processFile(path.join(basePath, "api-server", "src", "seed.ts"));
processFile(path.join(basePath, "api-server", "src", "seed-expansion.ts"));
processFile(path.join(basePath, "api-server", "src", "seed-expansion-part2.ts"));

