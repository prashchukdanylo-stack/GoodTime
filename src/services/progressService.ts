import { ValidationError, NotFoundError } from "../errors";

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
    isCompleted: (current?.isCompleted ?? false) || won,
  };
}


export async function recordLevelResult(db: any, input: RecordLevelResultInput) {
  const { playerId, levelId, roundsCompleted, won } = validateLevelResultInput(input);

  const player = await db.orm.public.Player.first({ id: playerId });
  if (!player || player.deletedAt) {
    throw new NotFoundError("player is not found");
  }

  return await db.transaction(async (tx: any) => {
    
    const session = await tx.orm.public.GameSession.create({
      playerId,
      levelId,
      roundsCompleted,
      won,
      status: won ? "completed" : "abandoned",
    });

  
    const existingProgress = await tx.orm.public.PlayerLevelProgress.first({
      playerId,
      levelId,
    });

    const nextProgress = computeNextProgress(existingProgress, roundsCompleted, won);

    if (existingProgress) {
      await tx.orm.public.PlayerLevelProgress.where({ id: existingProgress.id }).update(
        nextProgress,
      );
    } else {
      await tx.orm.public.PlayerLevelProgress.create({
        playerId,
        levelId,
        ...nextProgress,
      });
    }


    let reward: { item: any; quantity: number } | undefined = undefined;

    if (won) {
      const levelItem = await tx.orm.public.Item.first({ levelId });
      if (levelItem) {
        const existingPlayerItem = await tx.orm.public.PlayerItem.first({
          playerId,
          itemId: levelItem.id,
        });

        if (existingPlayerItem) {
          const updated = await tx.orm.public.PlayerItem.where({
            id: existingPlayerItem.id,
          }).update({
            quantity: existingPlayerItem.quantity + 1,
          });
          reward = { item: levelItem, quantity: updated.quantity };
        } else {
          const created = await tx.orm.public.PlayerItem.create({
            playerId,
            itemId: levelItem.id,
            quantity: 1,
          });
          reward = { item: levelItem, quantity: created.quantity };
        }
      }
    }

    return {
      session,
      progress: nextProgress,
      reward,
    };
  });
}
