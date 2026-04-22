import { Router } from "express";
import { db } from "@workspace/db";
import { inventoryItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AddInventoryItemBody } from "@workspace/api-zod";
import { getRequestPlayer } from "../lib/player-context";

const router: Router = Router();

const ITEM_DATA: Record<string, { description: string; effect: string; imageUrl: string }> = {
  capture_orb: {
    description: "A crystalline orb used to capture wild Pokemon.",
    effect: "capture",
    imageUrl: "/api/items/capture-orb",
  },
  enhanced_orb: {
    description: "An enhanced orb with a higher capture rate.",
    effect: "capture_enhanced",
    imageUrl: "/api/items/enhanced-orb",
  },
  void_orb: {
    description: "A dark orb that can capture even the rarest Pokemon.",
    effect: "capture_void",
    imageUrl: "/api/items/void-orb",
  },
  ether_vial: {
    description: "Restores 30 HP to one Pokemon.",
    effect: "heal_30",
    imageUrl: "/api/items/ether-vial",
  },
  greater_vial: {
    description: "Restores 60 HP to one Pokemon.",
    effect: "heal_60",
    imageUrl: "/api/items/greater-vial",
  },
  revive_crystal: {
    description: "Revives a fainted Pokemon with half HP.",
    effect: "revive",
    imageUrl: "/api/items/revive-crystal",
  },
  Pokemon_essence: {
    description: "Boosts an Pokemon's XP gain by 50% for one battle.",
    effect: "xp_boost",
    imageUrl: "/api/items/Pokemon-essence",
  },
};

router.get("/inventory", async (req, res) => {
  const player = await getRequestPlayer(req);
  if (!player) {
    res.json({ items: [], totalSlots: 50, usedSlots: 0 });
    return;
  }

  const items = await db
    .select()
    .from(inventoryItemsTable)
    .where(eq(inventoryItemsTable.playerId, player.id));

  const formattedItems = items.map((item) => ({
    id: item.id,
    itemType: item.itemType,
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    effect: item.effect,
    imageUrl: item.imageUrl,
  }));

  res.json({
    items: formattedItems,
    totalSlots: 50,
    usedSlots: formattedItems.length,
  });
});

router.post("/inventory", async (req, res) => {
  const body = AddInventoryItemBody.parse(req.body);

  const player = await getRequestPlayer(req);
  if (!player) {
    res.status(404).json({ error: "No player found" });
    return;
  }

  const itemInfo = ITEM_DATA[body.itemType] ?? {
    description: "A mysterious item.",
    effect: "unknown",
    imageUrl: "/api/items/unknown",
  };

  // Check if item already exists
  const existing = await db
    .select()
    .from(inventoryItemsTable)
    .where(eq(inventoryItemsTable.playerId, player.id));
  const existingItem = existing.find((i) => i.itemType === body.itemType);

  if (existingItem) {
    const [updated] = await db
      .update(inventoryItemsTable)
      .set({ quantity: existingItem.quantity + body.quantity })
      .where(eq(inventoryItemsTable.id, existingItem.id))
      .returning();

    res.status(201).json({
      id: updated.id,
      itemType: updated.itemType,
      name: updated.name,
      description: updated.description,
      quantity: updated.quantity,
      effect: updated.effect,
      imageUrl: updated.imageUrl,
    });
    return;
  }

  const [item] = await db
    .insert(inventoryItemsTable)
    .values({
      playerId: player.id,
      itemType: body.itemType,
      name: body.name,
      description: itemInfo.description,
      quantity: body.quantity,
      effect: itemInfo.effect,
      imageUrl: itemInfo.imageUrl,
    })
    .returning();

  res.status(201).json({
    id: item.id,
    itemType: item.itemType,
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    effect: item.effect,
    imageUrl: item.imageUrl,
  });
});

export default router;
