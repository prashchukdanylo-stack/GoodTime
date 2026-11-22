import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";

import { listPlayers, getPlayerById, createPlayer } from "./players.ts";
import { db } from "./prisma/db.ts";
import { hashPassword } from "./hashPassword.ts";
import {
  NotFoundError,
  ValidationError,
  recordLevelResult,
} from "./services/progressService.ts";

const app = express();

const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

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
      female: female?.name ?? undefined 
    };
  } catch (err) {
    console.error("Error in getSelectedNames:", err);
    return { male: undefined, female: undefined };
  }
};

async function getActiveLevelIds(): Promise<number[]> {
  const levels = await db.orm.public.Level.where({isActive: true}).all();
  return levels.map((lvl) => lvl.id);
}

app.get("/api/players", async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const players = await listPlayers(limit);
    res.json(players);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "error during fetching players" });
  }
});

app.get("/api/players/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const player = await getPlayerById(id);

    if (!player) {
      return res.status(404).json({ error: "player is not found" });
    }
    const { password: _omit, ...safePlayer } = player;
    res.json(safePlayer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "error during fetching player by id" });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!password || !email || !username) {
      return res.status(400).json({ error: "введіть ім'я, пошту та пароль" });
    }
    const dbPassword = await hashPassword(password);
    const newPlayer = await createPlayer(username, email, dbPassword);

    const { password: _omit, ...safePlayer } = newPlayer;
    res.status(200).json(safePlayer);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "registration error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email or password" });
    }
    const player = await db.orm.public.Player.first({ email });
    if (!player) {
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
      selectedCharacters: await getSelectedNames(player)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "login error" });
  }
});

app.get("/api/player-progress/:playerId", async (req, res) => {
  try {
    const { playerId } = req.params;

    const progressList = await db.orm.public.PlayerLevelProgress.where({
      playerId,
    }).all();
    res.json(progressList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "error during getting progress" });
  }
});

app.post("/api/level-result", async (req, res) => {
  try {
    const { playerId, levelId, roundsCompleted, won } = req.body ?? {};

    const allowedLevelIds = await getActiveLevelIds();
    const result = await recordLevelResult(db, {
      playerId,
      levelId,
      roundsCompleted,
      won,
      allowedLevelIds: allowedLevelIds,
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
    const { id } = req.params;

    const { maleCharacterId, femaleCharacterId } = req.body;
    if (
      typeof maleCharacterId !== "string" ||
      typeof femaleCharacterId !== "string"
    ) {
      return res.status(400).json({ error: "invalid ids" });
    }
    const player = await getPlayerById(id);
    if (!player) return res.status(404).json({ error: "player is not found" });

    const male = await db.orm.public.Character.first({ id: maleCharacterId });
    const female = await db.orm.public.Character.first({
      id: femaleCharacterId,
    });

    if (!male || !female) {
      return res.status(404).json({ error: "characters not found" });
    }

    await db.orm.public.Player.where({ id }).update({
      maleCharacterId,
      femaleCharacterId,
    });

    res.json({ 
      success: true, 
      selectedCharacters: { male: male.name, female: female.name } 
    });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ error: "error during saving characters" });
    }
  }
});


app.get("/api/levels", async (req, res) => {
  try {
    const levels = await db.orm.public.Level.where({isActive: true}).all();
    res.json(levels);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "error during fetching levels"});
  }
})

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});