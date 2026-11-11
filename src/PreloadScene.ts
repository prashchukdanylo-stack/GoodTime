import Phaser from "phaser";

import menuBackground from "./assets/menuBackground.png";
import cursor from "./assets/cursor.png";
import start from "./assets/startBtn.png";
import game_title from "./assets/game_title.png";
import goToMap from "./assets/go_to_map.png";
import victory from "./assets/victory.png"; 
import restart from "./assets/restart.png";
import gameOver from "./assets/game_over.png";
import accountBtn from "./assets/account_btn.png";
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    
    this.load.image("menuBackground", menuBackground);
    this.load.image("cursor", cursor);
    this.load.spritesheet("start", start, { frameWidth: 64, frameHeight: 32 });
    this.load.spritesheet("game_title", game_title, { frameWidth: 64, frameHeight: 32 });
    this.load.spritesheet("go_to_map", goToMap, {frameWidth:32, frameHeight:32});
    this.load.spritesheet("restart", restart, {frameWidth:64, frameHeight:32});
    this.load.spritesheet("game_over", gameOver, {frameWidth:64, frameHeight:32});
    this.load.image("victory", victory);
    this.load.spritesheet("account_btn", accountBtn, {frameWidth: 32, frameHeight: 32});
  }

  create() {
    this.anims.create({
      key: "game_title_anim",
      frames: this.anims.generateFrameNumbers("game_title", { start: 0, end: 2 }),
      frameRate: 3,
      repeat: -1,
    });

    this.scene.launch("CursorScene");
    this.scene.start("MainMenuScene");
  }
}