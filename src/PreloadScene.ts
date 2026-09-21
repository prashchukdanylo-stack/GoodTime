import Phaser from "phaser";
import male1Idle from "./assets/male1_idle.png";
import player2Idle from "./assets/player2_idle.png";
import attractionIdle from "./assets/attraction_idle.png";
import albertinaIdle from "./assets/albertina_idle.png";
import stephanIdle from "./assets/stephan_idle.png";
import shconbrunIdle from "./assets/schonbrun_idle.png";
import belvedereIdle from "./assets/belvedere_idle.png";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }
  preload() {
    const sheets = [
      { key: "attraction_idle", url: attractionIdle },
      { key: "albertina_idle", url: albertinaIdle },
      { key: "stephan_idle", url: stephanIdle },
      { key: "shconbrun_idle", url: shconbrunIdle },
      { key: "belvedere_idle", url: belvedereIdle },
      { key: "male1_idle", url: male1Idle },
      { key: "player2_idle", url: player2Idle },
    ];

    sheets.forEach((sheet) => {
      this.load.spritesheet(sheet.key, sheet.url, {
        frameWidth: 32,
        frameHeight: 32,
      });
    });
  }
  create() {
    const animConfigs = [
      { key: "idle1", texture: "male1_idle", start: 0, end: 5, frameRate: 5 },
      { key: "idle2", texture: "player2_idle", start: 0, end: 5, frameRate: 5 },
      {
        key: "attraction",
        texture: "attraction_idle",
        end: 2,
        frameRate: 4,
      },
      {
        key: "albertina",
        texture: "albertina_idle",
        end: 2,
        frameRate: 4,
      },
      {
        key: "stephan",
        texture: "stephan_idle",
        end: 6,
        frameRate: 7,
      },
      {
        key: "shconbrun",
        texture: "shconbrun_idle",
        end: 7,
        frameRate: 8,
      },
      {
        key: "belvedere",
        texture: "belvedere_idle",
        end: 1,
        frameRate: 4,
      },
    ];

    animConfigs.forEach(({ key, texture, start = 0, end, frameRate }) => {
      this.anims.create({
        key: key,
        frames: this.anims.generateFrameNumbers(texture, {
          start: start,
          end: end,
        }),
        frameRate: frameRate,
        repeat: -1,
      });
    });
    this.scene.start("CharactersScene");
  }
}
