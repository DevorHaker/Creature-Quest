import { pgTable, text, serial, integer, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const movesTable = pgTable("moves", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  power: integer("power").notNull().default(0),
  accuracy: integer("accuracy").notNull().default(100),
  pp: integer("pp").notNull().default(10),
  category: text("category").notNull().default("physical"),
  description: text("description").notNull().default(""),
  effect: text("effect"),
});

export const pokemonSpeciesTable = pgTable("pokemon_species", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type1: text("type1").notNull(),
  type2: text("type2"),
  baseHp: integer("base_hp").notNull().default(45),
  baseAttack: integer("base_attack").notNull().default(45),
  baseDefense: integer("base_defense").notNull().default(45),
  baseSpeed: integer("base_speed").notNull().default(45),
  baseSpecialAttack: integer("base_special_attack").notNull().default(45),
  baseSpecialDefense: integer("base_special_defense").notNull().default(45),
  evolutionLevel: integer("evolution_level"),
  evolvesIntoId: integer("evolves_into_id"),
  catchRate: integer("catch_rate").notNull().default(45),
  spriteUrl: text("sprite_url").notNull().default(""),
  backSpriteUrl: text("back_sprite_url").notNull().default(""),
  moveIds: jsonb("move_ids").$type<number[]>().notNull().default([]),
  rarity: text("rarity").notNull().default("common"),
});

export const insertPokemonSpeciesSchema = createInsertSchema(pokemonSpeciesTable).omit({ id: true });
export type InsertPokemonSpecies = z.infer<typeof insertPokemonSpeciesSchema>;
export type PokemonSpecies = typeof pokemonSpeciesTable.$inferSelect;

export const insertMoveSchema = createInsertSchema(movesTable).omit({ id: true });
export type InsertMove = z.infer<typeof insertMoveSchema>;
export type Move = typeof movesTable.$inferSelect;
