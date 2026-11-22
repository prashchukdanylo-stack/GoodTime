import { db } from "../prisma/db.ts";
import { Temporal } from "temporal-polyfill";

export class ConflictError extends Error {
  status = 409;
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export class NotFoundError extends Error {
  status = 404;
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export async function listPlayers(limit = 10, offset = 0) {
  return await db.orm.public.Player
    .select("id", "username", "email", "createdAt", "updatedAt", "deletedAt")
    .orderBy((p: any) => p.createdAt.desc())
    .limit(limit)
    .offset(offset)
    .all();
}

export async function listActivePlayers(limit = 10, offset = 0) {
  return await db.orm.public.Player
    .where({ deletedAt: null })
    .select("id", "username", "email", "createdAt", "updatedAt")
    .orderBy((p: any) => p.createdAt.desc())
    .limit(limit)
    .offset(offset)
    .all();
}

export async function getPlayerById(id: string) {
  return await db.orm.public.Player.first({ id });
}

export async function getPlayerByEmail(email: string) {
  return await db.orm.public.Player.first({ email });
}

export async function createPlayer(username: string, email: string, password: string) {
  return await db.orm.public.Player.create({
    username,
    email,
    password,
  });
}

export async function updatePlayer(id: string, data: { username?: string; email?: string }) {
  return await db.orm.public.Player.where({ id }).update(data);
}


export async function softDeletePlayer(id: string) {
  const player = await db.orm.public.Player.first({ id });
  if (!player) {
    throw new NotFoundError("Player not found");
  }
  if (player.deletedAt) {
    throw new ConflictError("Player is already deactivated (soft-deleted)");
  }

  const now = Temporal.Now.instant();
  await db.orm.public.Player.where({ id }).update({
    deletedAt: now,
  });

  return { id, deletedAt: now, success: true };
}


export async function restorePlayer(id: string) {
  const player = await db.orm.public.Player.first({ id });
  if (!player) {
    throw new NotFoundError("Player not found");
  }
  if (!player.deletedAt) {
    throw new ConflictError("Player is not deactivated");
  }

  await db.orm.public.Player.where({ id }).update({
    deletedAt: null,
  });

  return { id, restored: true };
}


export async function hardDeletePlayer(id: string) {
  const player = await db.orm.public.Player.first({ id });
  if (!player) {
    throw new NotFoundError("Player not found");
  }

  await db.orm.public.Player.where({ id }).delete();
  return { id, deleted: true };
}

export async function deletePlayer(id: string) {
  return await hardDeletePlayer(id);
}
