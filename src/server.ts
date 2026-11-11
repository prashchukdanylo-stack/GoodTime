import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";

import {listPlayers, getPlayerById, createPlayer} from "./players.ts";
import { db } from "./prisma/db.ts";
import { hashPassword } from "./hashPassword.ts";


const app = express();

const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get("/api/players", async (req, res) => {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const players = await listPlayers(limit);
        res.json(players);
    } catch(error) {
        console.error(error);
        res.status(500).json({error: "error during fetching players"});
    }
});

app.get("/api/players/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const player = await getPlayerById(id);

        if (!player) {
            return res.status(404).json({error: "player is not found"});
        }
        res.json(player);

    } catch(error) {
        console.error(error);
        res.status(500).json({error: "error during fetching player by id"});
    }
});

app.post("/api/register", async (req, res) => {
    try {
        const {username,email, password} = req.body;
        if (!password|| !email || !username){
            return res.status(400).json({error: "введіть ім'я, пошту та пароль"});
        }
        const dbPassword = await hashPassword(password);
        const newPlayer = await createPlayer(username, email, dbPassword);

        const {password: _omit, ...safePlayer} = newPlayer;
        res.status(200).json(safePlayer);
    }
    catch(e) {
        console.error(e);
        res.status(500).json({error: "registration error"});
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || ! password){
            return res.status(400).json({error: "email or password"});
        }
        const player = await db.orm.public.Player.first({email});
        if (!player) {
            return res.status(404).json({error: "player with this email is not found"});
        }
        const isMatch = await bcrypt.compare(password, player.password);
        if (!isMatch) {
            return res.status(401).json({error: "invalid password"});
        }
        res.json({
            id: player.id,
            username: player.username,
            email: player.email
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({error: "login error"});
    }
});

app.post("/api/save-level-progress", async (req, res) => {
    try {
        const {playerId, levelId, isCompleted} = req.body;
        if (!playerId || levelId === undefined) {
            return res.status(400).json({error: "error about playerId or levelId"});
        }
        const existingProgress = await db.orm.public.PlayerLevelProgress.first({
            playerId,
            levelId
        });

        let result;
        if (existingProgress) {
            result = await db.orm.public.PlayerLevelProgress.where({id: existingProgress.id}).update({isCompleted});
        } else {
            result = await db.orm.public.PlayerLevelProgress.create({
                playerId,
                levelId,
                isCompleted 
            });
        }
        res.json({success: true, result});
    } catch(error) {
        console.error(error);
        res.status(500).json({error: "error during saving progress"});
    }
});

app.get("/api/player-progress/:playerId", async (req,res) => {
    try {
        const {playerId} = req.params;

        const progressList = await db.orm.public.PlayerLevelProgress.where({playerId}).all();
        res.json(progressList);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "error during getting progress"});
    }
})
app.listen(PORT, () => {
    console.log("server is running");
})
