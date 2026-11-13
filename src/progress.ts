import type Phaser from "phaser";
import { LEVEL_IDS } from "./levelIds";

const API_URL = "http://localhost:3000";

interface LevelProgress {
  levelId: number;
  maxRoundReached: number;
  isCompleted: boolean;
}

const sceneById = new Map(
  Object.entries(LEVEL_IDS).map(([scene, id]) => [id, scene]),
);

const completedKey = (scene: string) => `${scene}_completed`;

export function isCompleted(
  registry: Phaser.Data.DataManager,
  sceneKey: string,
) {
  return registry.get(completedKey(sceneKey)) == true;
}

export function resetProgress(registry: Phaser.Data.DataManager) {
  Object.keys(LEVEL_IDS).forEach((scene) =>
    registry.set(completedKey(scene), false),
  );
  registry.set("progress_loaded", false);
}

export async function loadProgress(
  registry: Phaser.Data.DataManager,
  force = false,
) {
  const playerId = localStorage.getItem("playerId");
  if (!playerId) return false;
  if (!force && registry.get("progress_loaded")) return true;

  try {
    const res = await fetch(`${API_URL}/api/player-progress/${playerId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const list: LevelProgress[] = await res.json();

    resetProgress(registry);
    for (const item of list) {
      const scene = sceneById.get(item.levelId);
      if (scene && item.isCompleted) registry.set(completedKey(scene), true);
    }

    registry.set("progress_loaded", true);
    return true;
  } catch (error) {
    console.error("error with loading levels from server: ", error);
    return false;
  }
}

export async function submitLevelResults(
  registry: Phaser.Data.DataManager,
  scene: string,
  result: { roundsCompleted: number; won: boolean },
) {
    const playerId = localStorage.getItem("playerId");
    const levelId = LEVEL_IDS[scene];

    if (!playerId || levelId === undefined) return;

    const res = await fetch(`${API_URL}/api/level-result`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({playerId, levelId, ...result}),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    if (result.won) registry.set(completedKey(scene), true);
};
