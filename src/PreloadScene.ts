import Phaser from "phaser";
const assetFiles = import.meta.glob("./assets/*_idle.png", { 
  eager: true, 
  query: "?url" ,
  import: "default"
});

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }
  preload() {
    Object.entries(assetFiles).forEach(([filePath, url]) => {
      const texture = filePath.split("/").pop()?.replace(".png", "") || "";
      this.load.spritesheet(texture, url, {frameWidth:32, frameHeight:32});
    })
  }
  create() {
    Object.keys(assetFiles).forEach((filePath) => {
      const texture = filePath.split("/").pop()?.replace(".png", "") || "";
      const anim = texture.replace("idle", "anim");
      const totalFrames = this.textures.get(texture).frameTotal - 2;

      this.anims.create({
        key: anim,
        frames: this.anims.generateFrameNumbers(texture, {start: 0, end: Math.max(0,totalFrames)}),
        frameRate: 5,
        repeat: -1,
      })
    })
    this.scene.start("CharactersScene");
  }
}
