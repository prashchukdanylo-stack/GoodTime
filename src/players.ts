import {db} from "./prisma/db.ts";

export async function listPlayers(limit = 10) {
    return await db.orm.public.Player
    .select("id","username","email","createdAt","updatedAt")
    .orderBy((p) => p.createdAt.desc())
    .limit(limit)
    .all();
}

export async function getPlayerById(id: string) {
    return await db.orm.public.Player.first({id});
}

export async function createPlayer(username: string, email: string) {
    return await db.orm.public.Player.create({
        username: username,
        email: email
    });
}

export async function updatePlayer(id: string, data: { username?: string; email?: string }) {
    return await db.orm.public.Player.where({id}).update(data);
}

export async function deletePlayer(id: string) {
  return await db.orm.public.Player
    .where({ id })
    .delete();
}