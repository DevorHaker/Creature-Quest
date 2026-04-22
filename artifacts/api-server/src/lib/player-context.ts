import { Request } from "express";
import { db } from "@workspace/db";
import { playersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

/**
 * Extracts the current player from the X-Player-Id request header.
 * Falls back to the first player in the database if no header is provided.
 */
export async function getRequestPlayer(req: Request) {
  const playerIdHeader = req.headers["x-player-id"];
  const playerId = playerIdHeader ? parseInt(String(playerIdHeader), 10) : NaN;

  if (!isNaN(playerId) && playerId > 0) {
    const [player] = await db.select().from(playersTable).where(eq(playersTable.id, playerId));
    return player ?? null;
  }

  // Fallback: first player in DB
  const [player] = await db.select().from(playersTable).limit(1);
  return player ?? null;
}
