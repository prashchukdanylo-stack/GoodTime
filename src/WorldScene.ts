import Phaser from "phaser";

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  constructor() {
    super({ key: "WorldScene" });
  }
  create() {
   const {width, height} = this.scale;

    const title = this.add.text(width*0.4, height*0.1, "World Map", {
      color: "#c91d1d",
      fontSize: "32px",
    });
    this.player = this.add.rectangle(200, 200, 32, 32, 0xfffff);
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
      const duration = (distance/speed) * 1000;

      this.tweens.add({
        targets: this.player,
        x:tavern.x,
        y:tavern.y,
        duration:duration,
        ease: 'Linear',
        onComplete: () =>title.text = "Location is reached" ,
      });

    });
  }
}
