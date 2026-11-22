import Phaser from "phaser";
import "@fontsource/press-start-2p";
import { MainMenuScene } from "./game/scenes/MainMenuScene";
import { CharactersScene } from "./game/scenes/CharactersScene";
import { WorldScene } from "./game/scenes/WorldScene";
import { LocationScene } from "./game/scenes/LocationScene";
import { PreloadScene } from "./game/scenes/PreloadScene";
import { CursorScene } from "./game/scenes/CursorScene";
import { PraterScene } from "./game/scenes/minigames/PraterScene";
import { ShconbrunScene } from "./game/scenes/minigames/SchonbrunScene";
import { AlbertinaScene } from "./game/scenes/minigames/AlbertinaScene";

await document.fonts.load('12px "Press Start 2P"');

new Phaser.Game({
  width: window.innerWidth,
  height: window.innerHeight,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
  title: "Good Times",
  url: import.meta.env.URL || " ",
  version: import.meta.env.VERSION || "0.0.1",
  backgroundColor: "#708f9d",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    PreloadScene,
    MainMenuScene,
    CharactersScene,
    WorldScene,
    LocationScene,
    CursorScene,
    PraterScene,
    ShconbrunScene,
    AlbertinaScene,
  ],
});