import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const inventoryItemsTable = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  itemType: text("item_type").notNull().default("capture_orb"),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  quantity: integer("quantity").notNull().default(1),
  effect: text("effect").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItemsTable).omit({ id: true });
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItemsTable.$inferSelect;
