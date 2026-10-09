import Phaser from "phaser";
import viennaBackground from "./assets/viennaBackground.png";
import homeBackround from "./assets/homeBackground.png";
import menuBackground from "./assets/menuBackground.png";
import attracionBackground from "./assets/attractionBackground.png";
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
const assetFiles = import.meta.glob("./assets/*_idle.png", { 
  eager: true, 
  query: "?url" ,
  import: "default"
});

const names = import.meta.glob("./assets/*name.png", {
  eager: true,
  query: "?url",
  import: "default"
})
export class PreloadScene extends Phaser.Scene {
  
  constructor() {
    super({ key: "PreloadScene" });
  }
  preload() {
    Object.entries(assetFiles).forEach(([filePath, url]) => {
      const texture = filePath.split("/").pop()?.replace(".png", "") || "";
     this.load.spritesheet(texture, url, {frameWidth:32, frameHeight:32});
    });
    this.load.image("viennaBackground", viennaBackground);
    this.load.image("homeBackground",homeBackround);
    this.load.image("menuBackground", menuBackground);
    this.load.image("attractionBackground", attracionBackground);
    this.load.image("cursor", cursor);
    this.load.image("target", target);
    this.load.image("game_over", gameOver);
    this.load.image("victory", victory);
    this.load.image("menu_icon", menuIcon);
    this.load.image("coin", coin);
    this.load.image("round", round);
    this.load.image("attempts", attempts);
    this.load.image("hit", hit);
    this.load.spritesheet("go_to_map", go_to_map, {frameWidth:32, frameHeight: 32});
    this.load.spritesheet("restart", restart, {frameWidth:64, frameHeight: 32});
    this.load.spritesheet("confirm", confirm, {frameWidth:64, frameHeight: 32});
    this.load.spritesheet("start", start, {frameWidth:64, frameHeight:32});
    this.load.spritesheet("game_title", game_title, {frameWidth:64, frameHeight:32});

    Object.entries(names).forEach(([filePath, url]) => {
      const texture = filePath.split("/").pop()?.replace(".png", "") || "";
     this.load.image(texture, url);
    })
  }
  create() {
    
    Object.keys(assetFiles).forEach((filePath) =>   {
      const texture = filePath.split("/").pop()?.replace(".png", "") || "";
      
      
      const anim = texture.replace("idle", "anim");
      const totalFrames = this.textures.get(texture).frameTotal - 2;

      if (totalFrames > 1) {
        this.anims.create({
        key: anim,
        frames: this.anims.generateFrameNumbers(texture, {start: 0, end: Math.max(0,totalFrames)}),
        frameRate: 5,
        repeat: -1,
      })
      }
      
    });

    this.anims.create({
      key: "game_title_anim",
      frames: this.anims.generateFrameNumbers("game_title", {start:0, end: 2}),
      frameRate: 3,
      repeat: -1,
    })

    this.scene.launch("CursorScene");
    this.scene.start("MainMenuScene");
  }
}
