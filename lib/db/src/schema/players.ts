import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const playersTable = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatarColor: text("avatar_color").notNull().default("#6366f1"),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  currency: integer("currency").notNull().default(500),
  currentRegionId: integer("current_region_id").notNull().default(1),
  totalBattles: integer("total_battles").notNull().default(0),
  battlesWon: integer("battles_won").notNull().default(0),
  totalPokemonsCaptured: integer("total_pokemons_captured").notNull().default(0),
  badges: jsonb("badges").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPlayerSchema = createInsertSchema(playersTable).omit({ id: true, createdAt: true });
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof playersTable.$inferSelect;
