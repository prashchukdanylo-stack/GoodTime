import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";

import {
  listPlayers,
  listActivePlayers,
  getPlayerById,
  createPlayer,
  softDeletePlayer,
  restorePlayer,
  hardDeletePlayer,
} from "./repositories/playerRepository.ts";
import {
  getPlayerGameSessions,
  getPlayerInventory,
  usePlayerItem,
  finalizeGameSession,
  deleteGameSession,
} from "./repositories/gameRepository.ts";
import { db } from "./prisma/db.ts";
import { hashPassword } from "./utils/hashPassword.ts";
import {
  recordLevelResult
} from "./services/progressService.ts";
import { NotFoundError, ValidationError, ConflictError } from "./errors.ts";
import {
  assertValidUuid,
  validateLoginInput,
  validatePaginationInput,
  validateRegisterInput,
  validateUpdateCharactersInput,
} from "./validation/validators.ts";

const app = express();

const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

function isUniqueViolation(error: unknown): boolean {
  const err = error as {
    code?: string;
    cause?: { code?: string };
    message?: string;
  };
  const pgCode = err?.code ?? err?.cause?.code;
  return (
    pgCode === "23505" ||
    Boolean(err?.message && err.message.toLowerCase().includes("unique"))
  );
}

async function getSelectedNames(player: {
  maleCharacterId?: string | null;
  femaleCharacterId?: string | null;
}) {
  try {
    const male = player.maleCharacterId
      ? await db.orm.public.Character.first({ id: player.maleCharacterId })
      : undefined;

    const female = player.femaleCharacterId
      ? await db.orm.public.Character.first({ id: player.femaleCharacterId })
      : undefined;

    return {
      male: male?.name ?? undefined,
      female: female?.name ?? undefined,
    };
  } catch (err) {
    console.error("Error in getSelectedNames:", err);
    return { male: undefined, female: undefined };
  }
}

async function getActiveLevelIds(): Promise<number[]> {
  const levels = await db.orm.public.Level.where({ isActive: true }).all();
  return levels.map((lvl) => lvl.id);
}

app.get("/api/players", async (req, res) => {
  try {
    const { limit, offset } = validatePaginationInput(
      req.query.limit,
      req.query.offset,
    );
    const players = await listPlayers(limit, offset);
    res.json(players);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: "error during fetching players" });
  }
});

app.get("/api/players/active", async (req, res) => {
  try {
    const { limit, offset } = validatePaginationInput(
      req.query.limit,
      req.query.offset,
    );
    const players = await listActivePlayers(limit, offset);
    res.json(players);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: "error during fetching active players" });
  }
});

app.get("/api/players/:id", async (req, res) => {
  try {
    const id = assertValidUuid(req.params.id, "playerId");
    const player = await getPlayerById(id);

    if (!player || player.deletedAt) {
      return res.status(404).json({ error: "player is not found" });
    }
    const { password: _omit, ...safePlayer } = player;
    res.json(safePlayer);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: "error during fetching player by id" });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = validateRegisterInput(req.body);
    const dbPassword = await hashPassword(password);
    const newPlayer = await createPlayer(username, email, dbPassword);

    const { password: _omit, ...safePlayer } = newPlayer;
    return res.status(201).json(safePlayer);
  } catch (e) {
    if (e instanceof ValidationError) {
      return res.status(e.status).json({ error: e.message });
    }
    if (isUniqueViolation(e)) {
      return res
        .status(409)
        .json({ error: "player with this email already exists" });
    }
    console.error(e);
    return res.status(500).json({ error: "registration error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = validateLoginInput(req.body);
    const player = await db.orm.public.Player.first({ email });
    if (!player || player.deletedAt) {
      return res
        .status(404)
        .json({ error: "player with this email is not found" });
    }
    const isMatch = await bcrypt.compare(password, player.password);
    if (!isMatch) {
      return res.status(401).json({ error: "invalid password" });
    }
    res.json({
      id: player.id,
      username: player.username,
      email: player.email,
      selectedCharacters: await getSelectedNames(player),
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: "login error" });
  }
});

app.get("/api/player-progress/:playerId", async (req, res) => {
  try {
    const playerId = assertValidUuid(req.params.playerId, "playerId");
    const player = await getPlayerById(playerId);
    if (!player || player.deletedAt) {
      return res.status(404).json({ error: "player is not found" });
    }

    const progressList = await db.orm.public.PlayerLevelProgress.where({
      playerId,
    }).all();
    res.json(progressList);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: "error during getting progress" });
  }
});

app.post("/api/level-result", async (req, res) => {
  try {
    const { playerId, levelId, roundsCompleted, won } = req.body ?? {};
    assertValidUuid(playerId, "playerId");

    const allowedLevelIds = await getActiveLevelIds();
    const result = await recordLevelResult(db, {
      playerId,
      levelId,
      roundsCompleted,
      won,
      allowedLevelIds,
    });

    return res.json({
      success: true,
      ...result.progress,
      session: result.session,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.status).json({ error: error.message });
    }
    if (error instanceof NotFoundError) {
      return res.status(error.status).json({ error: error.message });
    }

    console.error(error);
    return res.status(500).json({ error: "error during saving level results" });
  }
});

app.get("/api/characters", async (req, res) => {
  try {
    const characters = await db.orm.public.Character.all();
    res.json(characters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "error during fetching characters" });
  }
});

app.put("/api/players/:id/characters", async (req, res) => {
  try {
    const { playerId, maleCharacterId, femaleCharacterId } =
      validateUpdateCharactersInput(req.params.id, req.body);

    const player = await getPlayerById(playerId);
    if (!player || player.deletedAt) {
      return res.status(404).json({ error: "player is not found" });
    }

    const male = await db.orm.public.Character.first({ id: maleCharacterId });
    const female = await db.orm.public.Character.first({
      id: femaleCharacterId,
    });

    if (!male || !female) {
      return res.status(404).json({ error: "characters not found" });
    }

    await db.orm.public.Player.where({ id: playerId }).update({
      maleCharacterId,
      femaleCharacterId,
    });

    res.json({
      success: true,
      selectedCharacters: { male: male.name, female: female.name },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ error: "error during saving characters" });
    }
  }
});

app.get("/api/levels", async (req, res) => {
  try {
    const levels = await db.orm.public.Level.where({ isActive: true }).all();
    res.json(levels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "error during fetching levels" });
  }
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});