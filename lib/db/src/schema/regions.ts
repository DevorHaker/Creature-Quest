import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const regionsTable = pgTable("regions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  minLevel: integer("min_level").notNull().default(1),
  maxLevel: integer("max_level").notNull().default(10),
  biome: text("biome").notNull().default("forest"),
  isUnlocked: boolean("is_unlocked").notNull().default(true),
  unlockRequirement: text("unlock_requirement"),
  imageUrl: text("image_url").notNull().default(""),
  wildPokemonSpeciesIds: jsonb("wild_pokemon_species_ids").$type<number[]>().notNull().default([]),
});

export const insertRegionSchema = createInsertSchema(regionsTable).omit({ id: true });
export type InsertRegion = z.infer<typeof insertRegionSchema>;
export type Region = typeof regionsTable.$inferSelect;
