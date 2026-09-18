import Phaser from "phaser";
import player1Idle from "./assets/player_idle.png";
import player2Idle from "./assets/player2_idle.png";
import attractionIdle from "./assets/attraction_idle.png";

export class WorldScene extends Phaser.Scene {
  private player: any;
  constructor() {
    super({ key: "WorldScene" });
  }
  preload() {
    this.load.spritesheet("attraction_idle", attractionIdle, {
      frameWidth:32,
      frameHeight:32,
    })
    this.load.spritesheet("player1_idle", player1Idle, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("player2_idle", player2Idle, {
      frameWidth: 32,
      frameHeight: 32,
    })
  }
  create() {
    const { width, height } = this.scale;

    const title = this.add.text(width * 0.4, height * 0.1, "Vienna", {
      color: "#c91d1d",
      fontSize: "32px",
    });
    const animConfigs = [
      {key: "idle", texture: "player1_idle", start:0, end:5, frameRate:4},
      {key: "idle2", texture: "player2_idle", start:0, end:5, frameRate:4},
      {key: "attraction", texture: "attraction_idle", start:0, end:2, frameRate:4},
    ];

    animConfigs.forEach(({key, texture,start, end, frameRate})=>{
      this.anims.create({
        key:key,
        frames: this.anims.generateFrameNumbers(texture, {
          start: start,
          end: end,
        }),
        frameRate: frameRate,
        repeat: -1,
      })
    });

    const attraction= this.add.sprite(700, 300, "attraction_idle");
    attraction.play("attraction");
    attraction.setScale(5);

    const player1Sprite = this.add.sprite(0,0,"player1_idle");
    const player2Sprite = this.add.sprite(15,0,"player2_idle");

    player1Sprite.play("idle");
    player2Sprite.play("idle2");

    this.player = this.add.container(width/2,height/2,[player1Sprite, player2Sprite]);
    
    this.player.setScale(4);  
    

   attraction.setInteractive({ useHandCursor: true });
    attraction.on("pointerdown", () => {
      this.tweens.killTweensOf(this.player);

      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        attraction.x,
        attraction.y,
      );
      const speed = 200;
      const duration = (distance / speed) * 1000;

      this.tweens.add({
        targets: this.player,
        x: attraction.x,
        y: attraction.y,
        duration: duration,
        ease: "Linear",
        onComplete: () => (title.text = "Location is reached"),
      });
    });
    
  }
}
