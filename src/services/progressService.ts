  export class ValidationError extends Error {
    status = 400;

    constructor(message: string) {
      super(message);
      this.name = "ValidationError";
    }
  }

  export class NotFoundError extends Error {
    status = 404;

    constructor(message: string) {
      super(message);
      this.name = "NotFoundError";
    }
  }

  export interface RecordLevelResultInput {
    playerId: unknown;
    levelId: unknown;
    roundsCompleted: unknown;
    won: unknown;
    allowedLevelIds: readonly number[];
  }

  export function validateLevelResultInput(input: RecordLevelResultInput) {
    const { playerId, levelId, roundsCompleted, won, allowedLevelIds } = input;

    if (typeof playerId !== "string" || playerId.trim().length === 0) {
      throw new ValidationError("invalid playerId");
    }
    if (typeof levelId !== "number" || !allowedLevelIds.includes(levelId)) {
      throw new ValidationError("invalid levelId");
    }
    if (
      typeof roundsCompleted !== "number" ||
      !Number.isInteger(roundsCompleted) ||
      roundsCompleted < 0
    ) {
      throw new ValidationError("invalid roundsCompleted");
    }
    if (typeof won !== "boolean") {
      throw new ValidationError("won must be boolean");
    }

    return { playerId, levelId, roundsCompleted, won };
  }

  export function computeNextProgress(
    current: { maxRoundReached: number; isCompleted: boolean } | null | undefined,
    roundsCompleted: number,
    won: boolean,
  ) {
      return {
          maxRoundReached: Math.max(current?.maxRoundReached ?? 0, roundsCompleted),
          isCompleted: (current?.isCompleted ?? false) || won
      }
  }

  export async function recordLevelResult(db: any, input: RecordLevelResultInput) {
    const { playerId, levelId, roundsCompleted, won } = validateLevelResultInput(input);

    const player = await db.orm.public.Player.first({ id: playerId });
    if (!player) {
      throw new NotFoundError("player is not found");
    }

    return await db.transaction(async (tx: any) => {
      const session = await tx.orm.public.GameSession.create({
        playerId,
        levelId,
        roundsCompleted,
        won,
      });

      const existingProgress = await tx.orm.public.PlayerLevelProgress.first({
        playerId,
        levelId,
      });

      const nextProgress = computeNextProgress(existingProgress, roundsCompleted, won);

      let progress;
      if (existingProgress) {
        progress = await tx.orm.public.PlayerLevelProgress.where({ id: existingProgress.id }).update(
          nextProgress,
        );
      } else {
        progress = await tx.orm.public.PlayerLevelProgress.create({
          playerId,
          levelId,
          ...nextProgress,
        });
      }

      return {
        session,
        progress: nextProgress,
      };
    });
  }