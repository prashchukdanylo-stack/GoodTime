import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import pg from "pg";
import { Temporal } from "temporal-polyfill";

let db: typeof import("../../src/prisma/db.ts").db;
let createPlayer: typeof import("../../src/repositories/playerRepository.ts").createPlayer;
let getPlayerById: typeof import("../../src/repositories/playerRepository.ts").getPlayerById;
let pool: pg.Pool;

beforeAll(async () => {
  const dbModule = await import("../../src/prisma/db.ts");
  const playersModule = await import("../../src/repositories/playerRepository.ts");

  db = dbModule.db;
  createPlayer = playersModule.createPlayer;
  getPlayerById = playersModule.getPlayerById;

  pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
});

async function resetTestDb() {
  await pool.query(
    `TRUNCATE TABLE "game_session", "player_level_progress", "player_item", "player" RESTART IDENTITY CASCADE`,
  );
}

describe("Players and characters (integration)", () => {
  beforeEach(async () => {
    await resetTestDb();
  });

  afterAll(async () => {
    await db.close();
    await pool.end();
  });

  it("створює гравця та повертає його за id", async () => {
    const created = await createPlayer(
      "danylo_test",
      "danylo.test@example.com",
      "hashed_pw_1",
    );

    expect(created.id).toBeTruthy();
    expect(created.email).toBe("danylo.test@example.com");

    const found = await getPlayerById(created.id);
    expect(found?.username).toBe("danylo_test");
  });

  it("кидає помилку при спробі створити гравця з дублікатом email", async () => {
    await createPlayer(
      "player_one",
      "duplicate@example.com",
      "hashed_pw_1",
    );

    await expect(
      createPlayer("player_two", "duplicate@example.com", "hashed_pw_2"),
    ).rejects.toThrow();
  });

  it("оновлює вибраних чоловічого та жіночого персонажів гравця", async () => {
    const maleChar = await db.orm.public.Character.first({ name: "Greg" });
    const femaleChar = await db.orm.public.Character.first({ name: "Laura" });

    if (!maleChar || !femaleChar) {
      throw new Error("Запусти seed.ts перед інтеграційними тестами персонажів");
    }

    const player = await createPlayer(
      "char_player",
      "char.player@example.com",
      "hashed_pw_1",
    );

    await db.orm.public.Player.where({ id: player.id }).update({
      maleCharacterId: maleChar.id,
      femaleCharacterId: femaleChar.id,
    });

    const updated = await getPlayerById(player.id);
    expect(updated?.maleCharacterId).toBe(maleChar.id);
    expect(updated?.femaleCharacterId).toBe(femaleChar.id);
  });

  it("фіксує deletedAt при м'якому видаленні гравця", async () => {
    const player = await createPlayer(
      "soft_del_player",
      "soft.del@example.com",
      "hashed_pw_1",
    );

    const deletedAt = Temporal.Now.instant();
    await db.orm.public.Player.where({ id: player.id }).update({
      deletedAt,
    });

    const found = await getPlayerById(player.id);
    expect(found?.deletedAt).not.toBeNull();
  });
});