import Phaser from "phaser";
import { MainMenuScene } from "./MainMenuScene";
import { WorldScene } from "./WorldScene";


new Phaser.Game({
  width: 900,
  height: 600,
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
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [MainMenuScene, WorldScene],
});