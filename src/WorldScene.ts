import Phaser from "phaser";

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  constructor() {
    super({ key: "WorldScene" });
    
  }
  
  create() {
    const { width, height } = this.scale;

    const title = this.add.text(width * 0.4, height * 0.1, "Vienna", {
      color: "#c91d1d",
      fontSize: "32px",
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
      data:object;
      scene: Phaser.Scene;
      sprite: Phaser.GameObjects.Sprite;
      speed: number;
      constructor(
        scene: Phaser.Scene,
        sprite: Phaser.GameObjects.Sprite,
        data:object,
        speed: number = 200,
      ) {
        this.scene = scene;
        this.sprite = sprite;
        this.speed = speed;
        this.data = data;

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
              this.scene.scene.start("LocationScene", this.data);
            },
          });
        });
      }
    }
   

    const attractionLocation = new GameLocation(this, attraction, {name:"attration"});
    const albertinaLocation = new GameLocation(this, albertina, {name:"albertina"});
    const stephanLocation = new GameLocation(this, stephan, {name:"stephan"});
    const shconbrunLocation = new GameLocation(this, shconbrun, {name:"shconbrun"});
    const belvedereLocation = new GameLocation(this, belvedere, {name:"belvedere"});
  }
}
