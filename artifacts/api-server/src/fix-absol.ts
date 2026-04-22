import fs from "fs";
import path from "path";
import { db } from "@workspace/db";
import { PokemonpeciesTable, movesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function run() {
  console.log("Starting Absol DB fix...");

  // Update DB: Snover -> Absol, type: Dark
  await db.update(PokemonpeciesTable)
    .set({ 
      name: "Absol", 
      type1: "Dark", 
      type2: null,
      spriteUrl: "/api/sprites/absol",
      backSpriteUrl: "/api/sprites/absol-back",
      evolvesIntoId: null // remove evolution line to Abomasnow
    })
    .where(eq(PokemonpeciesTable.name, "Snover"));

  const abomasnow = await db.select().from(PokemonpeciesTable).where(eq(PokemonpeciesTable.name, "Abomasnow")).then(res => res[0]);
  if (abomasnow) {
      console.log("Updated Abomasnow ID logic...");
  }

  console.log("DB update complete.");

  // Now update seed files
  const basePath = path.join("e:", "Pokemon_Game", "Creature-Quest", "artifacts", "api-server", "src");
  
  function replaceInFile(fileName: string) {
    const filePath = path.join(basePath, fileName);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, "utf-8");
    
    // Replace Snover to Absol
    content = content.replace(/"Snover"/g, `"Absol"`);
    content = content.replace(/\/api\/sprites\/snover/g, "/api/sprites/absol");
    
    // Find the Absol block and replace type
    // Before: name: "Absol", ... type1: "Grass", type2: "Ice",
    // After: name: "Absol", ... type1: "Dark", type2: null,
    const regex = new RegExp(`name:\\s*"Absol"[\\s\\S]*?type1:\\s*"Grass",\\s*type2:\\s*"Ice",`, "g");
    content = content.replace(regex, (match) => {
      return match.replace(/type1:\s*"Grass",\s*type2:\s*"Ice",/, `type1: "Dark", type2: null,`);
    });

    // Remove evolution logic in seed-expansion.ts
    // { name: "Abomasnow", evolvesFrom: "Absol" } -> delete this line
    content = content.replace(/\{ name:\s*"Abomasnow",\s*evolvesFrom:\s*"Absol"\s*\},?/g, "");

    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`Processed ${fileName}`);
  }

  replaceInFile("seed.ts");
  replaceInFile("seed-expansion.ts");
  replaceInFile("seed-expansion-part2.ts");
  
}

run().then(() => process.exit(0)).catch(console.error);
