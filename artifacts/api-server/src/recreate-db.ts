import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

async function run() {
  console.log("Dropping old tables...");
  const oldTables = ["inventory_items", "battles", "player_pokemons", "player_Pokemon", "player_pokemon", "moves", "Pokemon_species", "pokemon_species", "regions", "players"];
  
  for (const table of oldTables) {
    try {
      await db.execute(sql.raw(`DROP TABLE IF EXISTS "${table}" CASCADE`));
      console.log(`Dropped ${table}`);
    } catch (e) {
      console.log(`Failed to drop ${table}:`, e);
    }
  }

  console.log("Creating new tables...");

  await db.execute(sql.raw(`
    CREATE TABLE "players" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "avatar_color" text DEFAULT '#6366f1' NOT NULL,
      "level" integer DEFAULT 1 NOT NULL,
      "experience" integer DEFAULT 0 NOT NULL,
      "currency" integer DEFAULT 500 NOT NULL,
      "current_region_id" integer DEFAULT 1 NOT NULL,
      "total_battles" integer DEFAULT 0 NOT NULL,
      "battles_won" integer DEFAULT 0 NOT NULL,
      "total_pokemon_captured" integer DEFAULT 0 NOT NULL,
      "badges" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `));

  await db.execute(sql.raw(`
    CREATE TABLE "pokemon_species" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "description" text NOT NULL,
      "type1" text NOT NULL,
      "type2" text,
      "base_hp" integer DEFAULT 45 NOT NULL,
      "base_attack" integer DEFAULT 45 NOT NULL,
      "base_defense" integer DEFAULT 45 NOT NULL,
      "base_speed" integer DEFAULT 45 NOT NULL,
      "base_special_attack" integer DEFAULT 45 NOT NULL,
      "base_special_defense" integer DEFAULT 45 NOT NULL,
      "evolution_level" integer,
      "evolves_into_id" integer,
      "catch_rate" integer DEFAULT 45 NOT NULL,
      "sprite_url" text DEFAULT '' NOT NULL,
      "back_sprite_url" text DEFAULT '' NOT NULL,
      "move_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "rarity" text DEFAULT 'common' NOT NULL
    );
  `));

  await db.execute(sql.raw(`
    CREATE TABLE "moves" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "type" text NOT NULL,
      "power" integer DEFAULT 0 NOT NULL,
      "accuracy" integer DEFAULT 100 NOT NULL,
      "pp" integer DEFAULT 10 NOT NULL,
      "category" text DEFAULT 'physical' NOT NULL,
      "description" text DEFAULT '' NOT NULL,
      "effect" text
    );
  `));

  await db.execute(sql.raw(`
    CREATE TABLE "player_pokemons" (
      "id" serial PRIMARY KEY NOT NULL,
      "player_id" integer NOT NULL,
      "species_id" integer NOT NULL,
      "nickname" text,
      "level" integer DEFAULT 1 NOT NULL,
      "experience" integer DEFAULT 0 NOT NULL,
      "current_hp" integer DEFAULT 45 NOT NULL,
      "max_hp" integer DEFAULT 45 NOT NULL,
      "attack" integer DEFAULT 45 NOT NULL,
      "defense" integer DEFAULT 45 NOT NULL,
      "speed" integer DEFAULT 45 NOT NULL,
      "special_attack" integer DEFAULT 45 NOT NULL,
      "special_defense" integer DEFAULT 45 NOT NULL,
      "move_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "is_in_party" boolean DEFAULT false NOT NULL,
      "party_slot" integer,
      "status_condition" text,
      "captured_at" timestamp DEFAULT now() NOT NULL
    );
  `));

  await db.execute(sql.raw(`
    CREATE TABLE "battles" (
      "id" serial PRIMARY KEY NOT NULL,
      "player_id" integer NOT NULL,
      "type" text DEFAULT 'wild' NOT NULL,
      "status" text DEFAULT 'active' NOT NULL,
      "turn" integer DEFAULT 1 NOT NULL,
      "player_pokemon_data" jsonb NOT NULL,
      "opponent_pokemon_data" jsonb NOT NULL,
      "log" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "can_capture" boolean DEFAULT false NOT NULL,
      "result" text,
      "exp_gained" integer,
      "currency_gained" integer,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `));

  await db.execute(sql.raw(`
    CREATE TABLE "regions" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "description" text NOT NULL,
      "min_level" integer DEFAULT 1 NOT NULL,
      "max_level" integer DEFAULT 10 NOT NULL,
      "biome" text DEFAULT 'forest' NOT NULL,
      "is_unlocked" boolean DEFAULT true NOT NULL,
      "unlock_requirement" text,
      "image_url" text DEFAULT '' NOT NULL,
      "wild_pokemon_species_ids" jsonb DEFAULT '[]'::jsonb NOT NULL
    );
  `));

  await db.execute(sql.raw(`
    CREATE TABLE "inventory_items" (
      "id" serial PRIMARY KEY NOT NULL,
      "player_id" integer NOT NULL,
      "item_type" text DEFAULT 'capture_orb' NOT NULL,
      "name" text NOT NULL,
      "description" text DEFAULT '' NOT NULL,
      "quantity" integer DEFAULT 1 NOT NULL,
      "effect" text DEFAULT '' NOT NULL,
      "image_url" text DEFAULT '' NOT NULL
    );
  `));

  console.log("Database successfully recreated with new schema!");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
