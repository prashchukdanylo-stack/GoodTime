const API_URL = "http://localhost:3000";

export interface GameLevel {
  id: number;
  code: string;
  title: string;
  district: string;
  totalRounds: number;
  isActive: boolean;
};

export const FALLBACK_LEVEL_IDS: Record<string, number> = {
  PraterScene: 1,
  AlbertinaScene: 2,
  StephanScene: 3,
  SchonbrunScene: 4,
  BelvedereScene: 5,
};

let sceneToIdMap = new Map<string, number>(Object.entries(FALLBACK_LEVEL_IDS));
let idToSceneMap = new Map<number, string>(Object.entries(FALLBACK_LEVEL_IDS).map(([scene,id]) => [id, scene]));

export async function syncLevelsFromApi(): Promise<Record<string, number>> {
  const res = await fetch(`${API_URL}/api/levels`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const levels: GameLevel[] = await res.json();
  const nextSceneToId = new Map<string,number>();
  const nextIdToScene = new Map<number, string>();

  for (const level of levels) {
    if (level.isActive) {
      nextSceneToId.set(level.code, level.id);
      nextIdToScene.set(level.id, level.code);
    }
  }

  sceneToIdMap = nextSceneToId;
  idToSceneMap = nextIdToScene;

  return Object.fromEntries(sceneToIdMap.entries());
}

export function getLevelIdByScene(scene: string): number | undefined {
  return sceneToIdMap.get(scene);
}

export function getSceneByLevelId(levelId: number): string | undefined {
  return idToSceneMap.get(levelId);
}