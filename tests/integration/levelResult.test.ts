import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import pg from "pg";

const ALLOWED_LEVELS = [1, 2, 3, 4, 5];

let db: typeof import("../../src/prisma/db.ts").db;
let recordLevelResult: typeof import("../../src/services/progressService.ts").recordLevelResult;
let NotFoundError: typeof import("../../src/errors.ts").NotFoundError;
let pool: pg.Pool;

beforeAll(async () => {
  const dbModule = await import("../../src/prisma/db.ts");
  const progressModule = await import("../../src/services/progressService.ts");

  db = dbModule.db;
  recordLevelResult = progressModule.recordLevelResult;
  NotFoundError = NotFoundError;
  pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
});

async function resetTestDb() {
  await pool.query(
    `TRUNCATE TABLE "game_session", "player_level_progress", "player" RESTART IDENTITY CASCADE`,
  );
}

describe("recordLevelResult (integration)", () => {
  beforeEach(async () => {
    await resetTestDb();
  });

  afterAll(async () => {
    await db.close();
    await pool.end();
  });

  it("створює сесію та прогрес при першому проходженні рівня", async () => {
    const player = await db.orm.public.Player.create({
      username: "test_player",
      email: "test@example.com",
      password: "hashed_password",
    });

    const result = await recordLevelResult(db, {
      playerId: player.id,
      levelId: 1,
      roundsCompleted: 3,
      won: true,
      allowedLevelIds: ALLOWED_LEVELS,
    });

    expect(result.session).toBeDefined();
    expect(result.progress).toEqual({
      maxRoundReached: 3,
      isCompleted: true,
    });

    const progress = await db.orm.public.PlayerLevelProgress.first({
      playerId: player.id,
      levelId: 1,
    });
    expect(progress?.maxRoundReached).toBe(3);
    expect(progress?.isCompleted).toBe(true);
  });

  it("додає нову сесію та оновлює прогрес при наступній спробі", async () => {
    const player = await db.orm.public.Player.create({
      username: "test_player_2",
      email: "test2@example.com",
      password: "hashed_password",
    });

    await recordLevelResult(db, {
      playerId: player.id,
      levelId: 2,
      roundsCompleted: 2,
      won: false,
      allowedLevelIds: ALLOWED_LEVELS,
    });

    const second = await recordLevelResult(db, {
      playerId: player.id,
      levelId: 2,
      roundsCompleted: 5,
      won: true,
      allowedLevelIds: ALLOWED_LEVELS,
    });

    expect(second.progress).toEqual({
      maxRoundReached: 5,
      isCompleted: true,
    });
  });

  it("кидає NotFoundError, якщо гравця не існує", async () => {
    await expect(
      recordLevelResult(db, {
        playerId: "01933e2a-9999-7000-8000-000000000099",
        levelId: 1,
        roundsCompleted: 1,
        won: false,
        allowedLevelIds: ALLOWED_LEVELS,
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("відкочує транзакцію (ROLLBACK), якщо створення прогресу падає з помилкою", async () => {
    const player = await db.orm.public.Player.create({
      username: "rollback_player",
      email: "rollback@example.com",
      password: "hashed_password",
    });

    const originalTransaction = (db as any).transaction.bind(db);

    const brokenDb = Object.assign(
      Object.create(Object.getPrototypeOf(db)),
      db,
      {
        transaction: async (fn: (tx: any) => Promise<any>) => {
          return originalTransaction(async (tx: any) => {
            const originalProgress = tx.orm.public.PlayerLevelProgress;

            const brokenProgress = new Proxy(originalProgress, {
              get(target, prop) {
                if (prop === "create" || prop === "update") {
                  return async () => {
                    throw new Error("Simulated DB failure on progress create");
                  };
                }
                const value = Reflect.get(target, prop, target);
                return typeof value === "function" ? value.bind(target) : value;
              },
            });

            const ormProxy = new Proxy(tx.orm.public, {
              get(target, prop) {
                if (prop === "PlayerLevelProgress") {
                  return brokenProgress;
                }
                const value = Reflect.get(target, prop, target);
                return typeof value === "function" ? value.bind(target) : value;
              },
            });

            const rootOrmProxy = new Proxy(tx.orm, {
              get(target, prop) {
                if (prop === "public") {
                  return ormProxy;
                }
                const value = Reflect.get(target, prop, target);
                return typeof value === "function" ? value.bind(target) : value;
              },
            });

            const txProxy = new Proxy(tx, {
              get(target, prop) {
                if (prop === "orm") {
                  return rootOrmProxy;
                }
                const value = Reflect.get(target, prop, target);
                return typeof value === "function" ? value.bind(target) : value;
              },
            });

            return fn(txProxy);
          });
        },
      },
    );

    await expect(
      recordLevelResult(brokenDb, {
        playerId: player.id,
        levelId: 3,
        roundsCompleted: 2,
        won: false,
        allowedLevelIds: ALLOWED_LEVELS,
      }),
    ).rejects.toThrow("Simulated DB failure on progress create");

    const sessions = await db.orm.public.GameSession.where({
      playerId: player.id,
    }).all();
    expect(sessions).toHaveLength(0);
  });
});