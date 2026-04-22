import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const battlesTable = pgTable("battles", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  type: text("type").notNull().default("wild"),
  status: text("status").notNull().default("active"),
  turn: integer("turn").notNull().default(1),
  playerPokemonData: jsonb("player_pokemon_data").$type<Record<string, unknown>>().notNull(),
  opponentPokemonData: jsonb("opponent_pokemon_data").$type<Record<string, unknown>>().notNull(),
  playerPartyData: jsonb("player_party_data").$type<Record<string, unknown>[]>().notNull().default([]),
  requiresSwitch: boolean("requires_switch").notNull().default(false),
  log: jsonb("log").$type<string[]>().notNull().default([]),
  canCapture: boolean("can_capture").notNull().default(false),
  result: text("result"),
  expGained: integer("exp_gained"),
  currencyGained: integer("currency_gained"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBattleSchema = createInsertSchema(battlesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBattle = z.infer<typeof insertBattleSchema>;
export type Battle = typeof battlesTable.$inferSelect;
