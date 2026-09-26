import Phaser from "phaser";
import viennaBackground from "./assets/viennaBackground.png";
import homeBackround from "./assets/homeBackground.png";
import cursor from "./assets/cursor.png";
import confirm from "./assets/confirm.png";

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
    this.load.image("cursor", cursor);
    this.load.spritesheet("confirm", confirm, {frameWidth:64, frameHeight: 32});
    Object.entries(names).forEach(([filePath, url]) => {
      const texture = filePath.split("/").pop()?.replace(".png", "") || "";
     this.load.image(texture, url);
     console.log(texture);
    })
  }
  create() {
    
    Object.keys(assetFiles).forEach((filePath) =>   {
      const texture = filePath.split("/").pop()?.replace(".png", "") || "";
      
      
      const anim = texture.replace("idle", "anim");
      const totalFrames = this.textures.get(texture).frameTotal - 2;

      this.anims.create({
        key: anim,
        frames: this.anims.generateFrameNumbers(texture, {start: 0, end: Math.max(0,totalFrames)}),
        frameRate: 5,
        repeat: -1,
      })
    });

    this.scene.launch("CursorScene");
    this.scene.start("MainMenuScene");
  }
}
