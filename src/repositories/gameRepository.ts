import { db, pool } from "../prisma/db.ts";
import { ValidationError, NotFoundError, ConflictError } from "../errors";

export interface SessionFilterOptions {
  status?: "in_progress" | "completed" | "abandoned";
  won?: boolean;
  limit?: number;
  offset?: number;
}

export interface GameSessionWithLevel {
  id: string;
  playerId: string;
  levelId: number;
  status: string;
  roundsCompleted: number;
  won: boolean;
  createdAt: Date;
  levelTitle: string;
  levelCode: string;
  district: string;
  totalRounds: number;
}

export interface PlayerInventoryItem {
  id: string;
  playerId: string;
  itemId: string;
  quantity: number;
  acquiredAt: Date;
  itemName: string;
  itemDescription: string;
  levelId: number | null;
}

export async function getPlayerGameSessions(
  playerId: string,
  options: SessionFilterOptions = {},
): Promise<GameSessionWithLevel[]> {
  const limit = Math.max(1, Math.min(options.limit ?? 20, 100));
  const offset = Math.max(0, options.offset ?? 0);

  const conditions: string[] = ["gs.player_id = $1"];
  const params: any[] = [playerId];

  if (options.status) {
    params.push(options.status);
    conditions.push(`gs.status = $${params.length}`);
  }

  if (typeof options.won === "boolean") {
    params.push(options.won);
    conditions.push(`gs.won = $${params.length}`);
  }

  params.push(limit);
  const limitPlaceholder = `$${params.length}`;
  params.push(offset);
  const offsetPlaceholder = `$${params.length}`;

  const query = `
    SELECT 
      gs.id,
      gs.player_id as "playerId",
      gs.level_id as "levelId",
      gs.status,
      gs.rounds_completed as "roundsCompleted",
      gs.won,
      gs.created_at as "createdAt",
      l.title as "levelTitle",
      l.code as "levelCode",
      l.district,
      l.total_rounds as "totalRounds"
    FROM game_session gs
    JOIN level l ON gs.level_id = l.id
    WHERE ${conditions.join(" AND ")}
    ORDER BY gs.created_at DESC
    LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder};
  `;

  const { rows } = await pool.query(query, params);
  return rows;
}


export async function getPlayerInventory(
  playerId: string,
): Promise<PlayerInventoryItem[]> {
  const query = `
    SELECT 
      pi.id,
      pi.player_id as "playerId",
      pi.item_id as "itemId",
      pi.quantity,
      pi.acquired_at as "acquiredAt",
      i.name as "itemName",
      i.description as "itemDescription",
      i.level_id as "levelId"
    FROM player_item pi
    JOIN item i ON pi.item_id = i.id
    WHERE pi.player_id = $1 AND pi.quantity > 0
    ORDER BY pi.acquired_at DESC;
  `;

  const { rows } = await pool.query(query, [playerId]);
  return rows;
}


export async function usePlayerItem(playerId: string, itemId: string) {
  const player = await db.orm.public.Player.first({ id: playerId });
  if (!player || player.deletedAt) {
    throw new NotFoundError("Player not found or deactivated");
  }

  return await db.transaction(async (tx: any) => {
    const existing = await tx.orm.public.PlayerItem.first({
      playerId,
      itemId,
    });

    if (!existing || existing.quantity <= 0) {
      throw new NotFoundError("Item not found in player inventory");
    }

    if (existing.quantity > 1) {
      const updated = await tx.orm.public.PlayerItem.where({
        id: existing.id,
      }).update({
        quantity: existing.quantity - 1,
      });

      return {
        success: true,
        remainingQuantity: updated.quantity,
        action: "decremented",
      };
    } else {

      await tx.orm.public.PlayerItem.where({ id: existing.id }).delete();
      return {
        success: true,
        remainingQuantity: 0,
        action: "consumed_and_removed",
      };
    }
  });
}


export async function finalizeGameSession(
  sessionId: string,
  playerId: string,
  targetStatus: "completed" | "abandoned",
  roundsCompleted?: number,
) {
  const session = await db.orm.public.GameSession.first({ id: sessionId });
  if (!session || session.playerId !== playerId) {
    throw new NotFoundError("Game session not found");
  }

  if (session.status !== "in_progress") {
    throw new ConflictError(
      `Cannot update session: current status is '${session.status}' (expected 'in_progress')`,
    );
  }

  const updated = await db.orm.public.GameSession.where({
    id: sessionId,
  }).update({
    status: targetStatus,
    roundsCompleted: roundsCompleted ?? session.roundsCompleted,
    won: targetStatus === "completed",
  });

  return {
    success: true,
    session: updated,
  };
}


export async function deleteGameSession(sessionId: string, playerId: string) {
  const session = await db.orm.public.GameSession.first({ id: sessionId });
  if (!session || session.playerId !== playerId) {
    throw new NotFoundError("Game session not found");
  }

  await db.orm.public.GameSession.where({ id: sessionId }).delete();
  return { success: true, deletedSessionId: sessionId };
}
