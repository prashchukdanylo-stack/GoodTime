import type Phaser from "phaser";
import {
  FALLBACK_LEVEL_IDS,
  getLevelIdByScene,
  getSceneByLevelId,
  syncLevelsFromApi,
} from "./levelIds";

const API_URL = "http://localhost:3000";

interface LevelProgress {
  levelId: number;
  maxRoundReached: number;
  isCompleted: boolean;
}

const completedKey = (scene: string) => `${scene}_completed`;


function getKnownSceneKeys(): string[] {
  const fromMap: string[] = [];
  for (const scene of Object.keys(FALLBACK_LEVEL_IDS)) {
    if (!fromMap.includes(scene)) fromMap.push(scene);
  }
  return fromMap;
}

export function isCompleted(
  registry: Phaser.Data.DataManager,
  sceneKey: string,
) {
  return registry.get(completedKey(sceneKey)) == true;
}

export function resetProgress(registry: Phaser.Data.DataManager) {
  getKnownSceneKeys().forEach((scene) =>
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
    await syncLevelsFromApi();

    const res = await fetch(`${API_URL}/api/player-progress/${playerId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const list: LevelProgress[] = await res.json();

    resetProgress(registry);
    for (const item of list) {
      const scene = getSceneByLevelId(item.levelId);
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
    const levelId = getLevelIdByScene(scene);

    if (!playerId || levelId === undefined) return;

    const res = await fetch(`${API_URL}/api/level-result`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({playerId, levelId, ...result}),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    if (result.won) registry.set(completedKey(scene), true);
};
