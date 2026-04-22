import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const playerPokemonsTable = pgTable("player_pokemons", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  speciesId: integer("species_id").notNull(),
  nickname: text("nickname"),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  currentHp: integer("current_hp").notNull().default(45),
  maxHp: integer("max_hp").notNull().default(45),
  attack: integer("attack").notNull().default(45),
  defense: integer("defense").notNull().default(45),
  speed: integer("speed").notNull().default(45),
  specialAttack: integer("special_attack").notNull().default(45),
  specialDefense: integer("special_defense").notNull().default(45),
  moveIds: jsonb("move_ids").$type<number[]>().notNull().default([]),
  isInParty: boolean("is_in_party").notNull().default(false),
  partySlot: integer("party_slot"),
  statusCondition: text("status_condition"),
  capturedAt: timestamp("captured_at").notNull().defaultNow(),
});

export const insertPlayerPokemonSchema = createInsertSchema(playerPokemonsTable).omit({ id: true, capturedAt: true });
export type InsertPlayerPokemon = z.infer<typeof insertPlayerPokemonSchema>;
export type PlayerPokemon = typeof playerPokemonsTable.$inferSelect;
