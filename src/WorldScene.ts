import Phaser from "phaser";
import player1Idle from "./assets/player_idle.png";
import player2Idle from "./assets/player2_idle.png";
import attractionIdle from "./assets/attraction_idle.png";
import albertinaIdle from "./assets/albertina_idle.png";
import stephanIdle from "./assets/stephan_idle.png";
import shconbrunIdle from "./assets/schonbrun_idle.png";
import belvedereIdle from "./assets/belvedere_idle.png";

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  constructor() {
    super({ key: "WorldScene" });
    
  }
  
  preload() {
    const sheets = [
      { key: "attraction_idle", url: attractionIdle },
      {key: "albertina_idle", url: albertinaIdle},
      {key: "stephan_idle", url: stephanIdle},
      {key: "shconbrun_idle", url: shconbrunIdle},
      {key: "belvedere_idle", url: belvedereIdle},
      { key: "player1_idle", url: player1Idle },
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
    const { width, height } = this.scale;

    const title = this.add.text(width * 0.4, height * 0.1, "Vienna", {
      color: "#c91d1d",
      fontSize: "32px",
    });
    const animConfigs = [
      { key: "idle1", texture: "player1_idle", start: 0, end: 5, frameRate: 5 },
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
        end:2,
        frameRate:4,
      },
      {
        key: "stephan",
        texture: "stephan_idle",
        end:6,
        frameRate:7,
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
      }
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

    const createSprite = (
      x: number,
      y: number,
      texture: string,
      key: string,
      scale?: number,
    ): globalThis.Phaser.GameObjects.Sprite => {
      return this.add.sprite(x, y, texture).play(key).setScale(scale);
    };

    const attraction = createSprite(
      width - 130,
      210,
      "attraction_idle",
      "attraction",
      5,
    );

    const albertina = createSprite(
      90,
      400,
      "albertina_idle",
      "albertina",
      5,
    )

    const stephan = createSprite(
      width/2,
      500,
      "stephan_idle",
      "stephan",
      5,
    )

    const shconbrun = createSprite(
      130,
      200,
      "shconbrun_idle",
      "shconbrun",
      5
    )

    const belvedere = createSprite(
      width - 110,
      400,
      "belvedere_idle",
      "belvedere",
      5
    )

    const player1Sprite = createSprite(0, 0, "player1_idle", "idle1");
    const player2Sprite = createSprite(15, 0, "player2_idle", "idle2");

    this.player = this.add.container(width / 2, height / 2, [
      player1Sprite,
      player2Sprite,
    ]);
    const player = this.player;

    player.setScale(4);


     class GameLocation {
      scene: Phaser.Scene;
      sprite: Phaser.GameObjects.Sprite;
      speed: number;
      constructor(
        scene: Phaser.Scene,
        sprite: Phaser.GameObjects.Sprite,
        speed: number = 200,
        onReached?: () => void,
      ) {
        this.scene = scene;
        this.sprite = sprite;
        this.speed = speed;

        this.sprite.setInteractive({ useHandCursor: true });
        this.sprite.on("pointerdown", () => {
          this.scene.tweens.killTweensOf(player);
          const distance = Phaser.Math.Distance.Between(
            player.x,
            player.y,
            this.sprite.x,
            this.sprite.y,
          );
          const duration = (distance / speed) * 1000;
          this.scene.tweens.add({
            targets: player,
            x: this.sprite.x,
            y: this.sprite.y,
            duration: duration,
            ease: "Linear",
            onComplete: () => {
              if (onReached) {
                onReached();
              }
            },
          });
        });
      }
    }
   

    const attractionLocation = new GameLocation(this, attraction);
    const albertinaLocation = new GameLocation(this, albertina);
    const stephanLocation = new GameLocation(this, stephan);
    const shconbrunLocation = new GameLocation(this, shconbrun);
    const belvedereLocation = new GameLocation(this, belvedere);
  }
}
