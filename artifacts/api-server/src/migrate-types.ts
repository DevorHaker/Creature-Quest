import { db } from "@workspace/db";
import { movesTable, pokemonSpeciesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const typeMapping: Record<string, string> = {
  "Earth": "Ground",
  "Air": "Flying",
  "Lightning": "Electric",
  "Shadow": "Ghost",
  "Crystal": "Ice",
  "Nature": "Grass",
  "Arcane": "Psychic",
  "Void": "Dragon"
};

async function migrateTypes() {
  console.log("Starting type migration...");

  const species = await db.select().from(pokemonSpeciesTable);
  for (const s of species) {
    let t1 = typeMapping[s.type1] || s.type1;
    let t2 = s.type2 ? (typeMapping[s.type2] || s.type2) : null;
    if (t1 !== s.type1 || t2 !== s.type2) {
      await db.update(pokemonSpeciesTable).set({ type1: t1, type2: t2 }).where(eq(pokemonSpeciesTable.id, s.id));
      console.log(`Updated ${s.name}: ${s.type1}/${s.type2} -> ${t1}/${t2}`);
    }
  }

  const moves = await db.select().from(movesTable);
  for (const m of moves) {
    let mt = typeMapping[m.type] || m.type;
    if (mt !== m.type) {
      await db.update(movesTable).set({ type: mt }).where(eq(movesTable.id, m.id));
      console.log(`Updated Move ${m.name}: ${m.type} -> ${mt}`);
    }
  }

  console.log("Type migration completed!");
  process.exit(0);
}

migrateTypes().catch(console.error);
