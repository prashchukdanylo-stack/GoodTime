import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import pg from "pg";

let db: typeof import("../../src/prisma/db.ts").db;
let pool: pg.Pool;

let playerRepo: typeof import("../../src/repositories/playerRepository.ts");
let gameRepo: typeof import("../../src/repositories/gameRepository.ts");
let progressService: typeof import("../../src/services/progressService.ts");
let errors: typeof import("../../src/errors.ts");
beforeAll(async () => {
  const dbModule = await import("../../src/prisma/db.ts");
  playerRepo = await import("../../src/repositories/playerRepository.ts");
  gameRepo = await import("../../src/repositories/gameRepository.ts");
  progressService = await import("../../src/services/progressService.ts");
  errors = await import("../../src/errors.ts");
  db = dbModule.db;
  pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
});

async function resetDb() {
  await pool.query(
    `TRUNCATE TABLE "game_session", "player_level_progress", "player_item", "player" RESTART IDENTITY CASCADE`,
  );
}

describe("Курсова робота: Операції з базою даних (Етап 1)", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await db.close();
    await pool.end();
  });

  describe("1. Комплексне створення в транзакції (Session + Progress + Reward Item)", () => {
    it("створює сесію, прогрес та нараховує предмет в інвентар при перемозі", async () => {
      const player = await playerRepo.createPlayer(
        "champion",
        "champion@example.com",
        "hashed_pw",
      );

      const item =
        (await db.orm.public.Item.first({ levelId: 1 })) ??
        (await db.orm.public.Item.create({
          name: "Prater Test Cap",
          description: "Exclusive souvenir cap",
          levelId: 1,
        }));

      const result = await progressService.recordLevelResult(db, {
        playerId: player.id,
        levelId: 1,
        roundsCompleted: 3,
        won: true,
        allowedLevelIds: [1, 2, 3, 4, 5],
      });

      
      expect(result.session.id).toBeDefined();
      expect(result.session.won).toBe(true);
      expect(result.session.status).toBe("completed");

     
      expect(result.progress.maxRoundReached).toBe(3);
      expect(result.progress.isCompleted).toBe(true);

      expect(result.reward).toBeDefined();
      expect(result.reward?.item.id).toBe(item.id);
      expect(result.reward?.quantity).toBe(1);

      const secondResult = await progressService.recordLevelResult(db, {
        playerId: player.id,
        levelId: 1,
        roundsCompleted: 3,
        won: true,
        allowedLevelIds: [1, 2, 3, 4, 5],
      });

      expect(secondResult.reward?.quantity).toBe(2);
    });

    it("відкочує транзакцію (ROLLBACK) при виникненні помилки", async () => {
      const player = await playerRepo.createPlayer(
        "rollback_user",
        "rollback@example.com",
        "hashed_pw",
      );

    
      await expect(
        db.transaction(async (tx: any) => {
          await tx.orm.public.GameSession.create({
            playerId: player.id,
            levelId: 1,
            roundsCompleted: 2,
            won: false,
          });

         
          throw new Error("Simulated failure in transaction");
        }),
      ).rejects.toThrow("Simulated failure in transaction");

     
      const sessions = await db.orm.public.GameSession.where({
        playerId: player.id,
      }).all();
      expect(sessions.length).toBe(0);
    });
  });

  describe("2. Оновлення з перевіркою стану (Conditional UPDATE)", () => {
    it("зменшує кількість предмета та видаляє запис при досягненні 0", async () => {
      const player = await playerRepo.createPlayer(
        "item_user",
        "item_user@example.com",
        "hashed_pw",
      );

      const item = await db.orm.public.Item.first({});
      if (!item) throw new Error("Seed items first");

      
      await db.orm.public.PlayerItem.create({
        playerId: player.id,
        itemId: item.id,
        quantity: 2,
      });

      
      const firstUse = await gameRepo.usePlayerItem(player.id, item.id);
      expect(firstUse.remainingQuantity).toBe(1);
      expect(firstUse.action).toBe("decremented");

      
      const secondUse = await gameRepo.usePlayerItem(player.id, item.id);
      expect(secondUse.remainingQuantity).toBe(0);
      expect(secondUse.action).toBe("consumed_and_removed");

      
      await expect(gameRepo.usePlayerItem(player.id, item.id)).rejects.toThrow(
        errors.NotFoundError,
      );
    });

    it("забороняє фіналізацію сесії, яка вже була завершена (Race Condition / Conflict)", async () => {
      const player = await playerRepo.createPlayer(
        "session_user",
        "session@example.com",
        "hashed_pw",
      );

      const session = await db.orm.public.GameSession.create({
        playerId: player.id,
        levelId: 1,
        status: "in_progress",
        roundsCompleted: 1,
      });

      
      const finalized = await gameRepo.finalizeGameSession(
        session.id,
        player.id,
        "completed",
        3,
      );
      expect(finalized.session?.status).toBe("completed");

      
      await expect(
        gameRepo.finalizeGameSession(session.id, player.id, "abandoned"),
      ).rejects.toThrow(errors.ConflictError);
    });
  });

  describe("3. Видалення сутностей (Soft Delete та Hard Delete з CASCADE)", () => {
    it("виконує м'яке видалення (Soft Delete) та фільтрацію в activePlayers", async () => {
      const player = await playerRepo.createPlayer(
        "soft_user",
        "soft@example.com",
        "hashed_pw",
      );

      const activeBefore = await playerRepo.listActivePlayers();
      expect(activeBefore.some((p: any) => p.id === player.id)).toBe(true);

      
      const softResult = await playerRepo.softDeletePlayer(player.id);
      expect(softResult.success).toBe(true);
      expect(softResult.deletedAt).toBeDefined();

     
      await expect(playerRepo.softDeletePlayer(player.id)).rejects.toThrow(
        playerRepo.ConflictError,
      );

      
      const activeAfter = await playerRepo.listActivePlayers();
      expect(activeAfter.some((p: any) => p.id === player.id)).toBe(false);

      
      await playerRepo.restorePlayer(player.id);
      const activeRestored = await playerRepo.listActivePlayers();
      expect(activeRestored.some((p: any) => p.id === player.id)).toBe(true);
    });

    it("демонструє жорстке видалення (Hard Delete) з каскадним видаленням пов'язаних записів", async () => {
      const player = await playerRepo.createPlayer(
        "cascade_user",
        "cascade@example.com",
        "hashed_pw",
      );

     
      await db.orm.public.GameSession.create({
        playerId: player.id,
        levelId: 1,
        roundsCompleted: 2,
        won: false,
      });

      await db.orm.public.PlayerLevelProgress.create({
        playerId: player.id,
        levelId: 1,
        maxRoundReached: 2,
        isCompleted: false,
      });

      
      await playerRepo.hardDeletePlayer(player.id);

      
      const found = await playerRepo.getPlayerById(player.id);
      expect(found).toBeNull();

    
      const sessions = await db.orm.public.GameSession.where({
        playerId: player.id,
      }).all();
      expect(sessions.length).toBe(0);

      const progress = await db.orm.public.PlayerLevelProgress.where({
        playerId: player.id,
      }).all();
      expect(progress.length).toBe(0);
    });
  });

  describe("4. Прості SELECT-запити (WHERE, JOIN, ORDER BY, LIMIT/OFFSET)", () => {
    it("повертає історію сесій гравця з JOIN до таблиці Level та сортуванням", async () => {
      const player = await playerRepo.createPlayer(
        "select_user",
        "select@example.com",
        "hashed_pw",
      );

    
      await db.orm.public.GameSession.create({
        playerId: player.id,
        levelId: 1,
        status: "completed",
        roundsCompleted: 3,
        won: true,
      });

      await db.orm.public.GameSession.create({
        playerId: player.id,
        levelId: 2,
        status: "abandoned",
        roundsCompleted: 1,
        won: false,
      });

     
      const sessions = await gameRepo.getPlayerGameSessions(player.id, {
        limit: 10,
        offset: 0,
      });

      expect(sessions.length).toBe(2);
      expect(sessions[0].levelTitle).toBeDefined();
      expect(sessions[0].district).toBeDefined();
      expect(sessions[0].createdAt).toBeDefined();

      
      const completedSessions = await gameRepo.getPlayerGameSessions(player.id, {
        status: "completed",
      });
      expect(completedSessions.length).toBe(1);
      expect(completedSessions[0].status).toBe("completed");
    });

    it("повертає інвентар гравця з JOIN до таблиці Item", async () => {
      const player = await playerRepo.createPlayer(
        "inv_user",
        "inv@example.com",
        "hashed_pw",
      );

      const item = await db.orm.public.Item.first({});
      if (!item) throw new Error("Seed items first");

      await db.orm.public.PlayerItem.create({
        playerId: player.id,
        itemId: item.id,
        quantity: 3,
      });

      const inventory = await gameRepo.getPlayerInventory(player.id);
      expect(inventory.length).toBe(1);
      expect(inventory[0].itemName).toBe(item.name);
      expect(inventory[0].itemDescription).toBe(item.description);
      expect(inventory[0].quantity).toBe(3);
    });
  });
});
