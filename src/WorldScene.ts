import Phaser from "phaser";
import playerIdle from "./assets/player_idle.png";
export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  constructor() {
    super({ key: "WorldScene" });
  }
  preload() {
    this.load.spritesheet("player_idle", playerIdle, {
      frameWidth: 32,
      frameHeight: 32,
    });
  }
  create() {
    const { width, height } = this.scale;

    const title = this.add.text(width * 0.4, height * 0.1, "World Map", {
      color: "#c91d1d",
      fontSize: "32px",
    });
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("player_idle", {
        start: 0,
        end: 5,
      }),
      frameRate: 4,
      repeat: -1, //infinite repeat
    });
    this.player = this.physics.add.sprite(
      100,
      100,
      "player_idle",
    );
    this.player.play('idle');
    this.player.setScale(4);  
    const tavern = this.add.rectangle(600, 200, 48, 48, 0xe67e22);
   tavern.setInteractive({ useHandCursor: true });
    tavern.on("pointerdown", () => {
      this.tweens.killTweensOf(this.player);

      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        tavern.x,
        tavern.y,
      );
      const speed = 200;
      const duration = (distance / speed) * 1000;

      this.tweens.add({
        targets: this.player,
        x: tavern.x,
        y: tavern.y,
        duration: duration,
        ease: "Linear",
        onComplete: () => (title.text = "Location is reached"),
      });
    });
    
  }
}
