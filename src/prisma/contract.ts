import { defineContract } from "@prisma/orm-postgres/contract-builder";

export const contract = defineContract(
  { naming: { tables: "snake_case", columns: "snake_case" } },
  ({ field, model, rel }) => {
    const Player = model("Player", {
      fields: {
        id: field.id.uuidv7String(),
        username: field.text().optional(),
        email: field.text().unique(),
        createdAt: field.temporal.createdAtString(),
        updatedAt: field.temporal.updatedAtString(),
      },
    });

    const GameSession = model("GameSession", {
      fields: {
        id: field.id.uuidv7String(),
        playerId: field.uuidString(),
        levelId: field.int(),
        roundsCompleted: field.int(),
        won: field.boolean(),
        createdAt: field.temporal.createdAtString(),
        updatedAt: field.temporal.updatedAtString(),
      },
    });

    const PlayerLevelProgress = model("PlayerLevelProgress", {
      fields: {
        id: field.id.uuidv7String(),
        playerId: field.uuidString(),
        levelId: field.int(),
        maxRoundReached: field.int().default(0),
        isCompleted: field.boolean().default(false),
        createdAt: field.temporal.createdAtString(),
        updatedAt: field.temporal.updatedAtString(),
      },
    });

    return {
      models: {
        Player: Player.relations({
          levels: rel.hasMany(PlayerLevelProgress, { by: "playerId" }),
          sessions: rel.hasMany(GameSession, { by: "playerId" }),
        }),
        GameSession: GameSession.relations({
          player: rel.belongsTo(Player, { from: "playerId", to: "id" }),
        }),
        PlayerLevelProgress: PlayerLevelProgress.relations({
          player: rel.belongsTo(Player, { from: "playerId", to: "id" }),
        }),
      },
    };
  },
);
