import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

async function run() {
  await db.execute(sql`TRUNCATE table moves, Pokemon_species, regions, players, player_Pokemon, battles, inventory_items CASCADE`);
  console.log("Database perfectly reset.");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
