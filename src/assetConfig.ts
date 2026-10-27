import viennaBackground from "./assets/viennaBackground.png";
import homeBackground from "./assets/homeBackground.png";
import menuBackground from "./assets/menuBackground.png";
import attracionBackground from "./assets/attractionBackground.png";
import albertinaBackground from "./assets/albertinaBackground.png";
import cursor from "./assets/cursor.png";
import confirm from "./assets/confirm.png";
import game_title from "./assets/game_title.png";
import start from "./assets/startBtn.png";
import target from "./assets/target.png";
import gameOver from "./assets/game_over.png";
import victory from "./assets/victory.png";
import menuIcon from "./assets/menu_icon.png";
import coin from "./assets/coin.png";
import round from "./assets/round.png";
import attempts from "./assets/attempts.png";
import hit from "./assets/hit.png";
import restart from "./assets/restart.png";
import go_to_map from "./assets/go_to_map.png";
import bush from "./assets/bush.png";
import albertinaFinishedArt1 from "./assets/albertina_finished_art1.jpg";

export const assetFiles = import.meta.glob("./assets/*_idle.png", { eager: true, query: "?url", import: "default" });
export const names = import.meta.glob("./assets/*name.png", { eager: true, query: "?url", import: "default" });


export const staticImages: Record<string, string> = {
  viennaBackground,
  homeBackground,
  menuBackground,
  attractionBackground: attracionBackground,
  albertinaBackground,
  cursor,
  target,
  game_over: gameOver,
  victory,
  menu_icon: menuIcon,
  coin,
  round,
  attempts,
  hit,
  bush,
  albertina_finished_art1: albertinaFinishedArt1,
};

export const spriteSheets = [
  { key: "go_to_map", url: go_to_map, frameWidth: 32, frameHeight: 32 },
  { key: "restart", url: restart, frameWidth: 64, frameHeight: 32 },
  { key: "confirm", url: confirm, frameWidth: 64, frameHeight: 32 },
  { key: "start", url: start, frameWidth: 64, frameHeight: 32 },
  { key: "game_title", url: game_title, frameWidth: 64, frameHeight: 32 },
];