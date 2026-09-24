import Phaser from "phaser";
const assetFiles = import.meta.glob("./assets/*.png", { 
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
      if (texture.includes("Background")) {
        console.log("yes");
        this.load.image(texture, url);
      } else this.load.spritesheet(texture, url, {frameWidth:32, frameHeight:32});
    })
  }
  create() {
    Object.keys(assetFiles).forEach((filePath) =>   {
      const texture = filePath.split("/").pop()?.replace(".png", "") || "";
      console.log(texture);
      if (texture.includes("Background")) return;
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
