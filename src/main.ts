import Phaser from "phaser";
import "@fontsource/press-start-2p";
import { MainMenuScene } from "./MainMenuScene";
import {CharactersScene} from "./CharactersScene";
import { WorldScene } from "./WorldScene";
import {LocationScene } from "./LocationScene";
import { PreloadScene } from "./PreloadScene";
import { CursorScene } from "./CursorScene";
import { PraterScene } from "./minigames/PraterScene";
import { ShconbrunScene } from "./minigames/SchonbrunScene";
import { AlbertinaScene } from "./minigames/AlbertinaScene";

await document.fonts.load('12px "Press Start 2P"');

const savedScene = localStorage.getItem("lastScene") || "MainMenuScene";

const game = new Phaser.Game({
  width: window.innerWidth,
  height: window.innerHeight,
  pixelArt: true,
  physics: {
    default:'arcade',
    arcade: {
      gravity:{y:0, x:0},
      debug:false,
    },
  },
  title: "Good Times",
  url: import.meta.env.URL || ' ',
  version: import.meta.env.VERSION || "0.0.1",
  backgroundColor: '#708f9d',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [PreloadScene,MainMenuScene, CharactersScene, WorldScene, LocationScene,CursorScene, PraterScene, ShconbrunScene, AlbertinaScene],
});

/*game.events.once("ready", () => {
  if (savedScene && savedScene !== "MainMenuScene" && localStorage.getItem("playerId")) {
    game.scene.start(savedScene);
  }
})
  */