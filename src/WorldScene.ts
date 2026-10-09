import Phaser from "phaser";


interface PlayerProps {
  name: string,
  texture: string,
  anim: string
}
interface PlayersProps {
  male: PlayerProps,
  female: PlayerProps
}

interface LocationConfig {
  name: string,
  key: string,
  x: number,
  y: number,
  scale?: number
}



class GameLocation {
      private isCompleted: boolean;
      private data:object;
     private scene: Phaser.Scene;
      public sprite: Phaser.GameObjects.Sprite;
      private target: Phaser.GameObjects.Container;
      private speed: number;
      private starIcon?: Phaser.GameObjects.Image;
      constructor(
        scene: Phaser.Scene,
        sprite: Phaser.GameObjects.Sprite,
        data:object,
        target: Phaser.GameObjects.Container,
        speed: number = 200,
      ) {
        this.scene = scene;
        this.sprite = sprite;
        this.speed = speed;
        this.data = data;
        this.target = target;
        this.isCompleted = this.scene.registry.get(`${this.sprite.texture.key}_completed`);
        this.sprite.setInteractive();
        this.sprite.on("pointerdown", this.moveToLocation, this);
        this.sprite.on("pointerover", () => this.scene.game.events.emit("cursor:hover"));
        this.sprite.on("pointerout", () => this.scene.game.events.emit("cursor:default"));

        if (this.isCompleted && !this.starIcon) {
          this.createStar();
        }
      }

      private moveToLocation():void {
        this.scene.game.events.emit("cursor:default");
        this.scene.tweens.killTweensOf(this.target);
        const distance = Phaser.Math.Distance.Between(
            this.target.x,
            this.target.y,
            this.sprite.x,
            this.sprite.y,
          );
          const duration = (distance / this.speed) * 1000;
          this.scene.tweens.add({
            targets: this.target,
            x: this.sprite.x,
            y: this.sprite.y,
            duration: duration,
            ease: "Linear",
            onComplete: () => {
              this.scene.scene.start("LocationScene", this.data);
            },
          });
      } 

      private createStar() {
        this.starIcon = this.scene.add.image(this.sprite.x - 50, this.sprite.y + 40, "coin").setScale(2);
      }
    }
   
    

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  
  constructor() {
    super({ key: "WorldScene" });
    
  }
  
  create(data:PlayersProps) {
    const { width, height } = this.scale;

    this.add.image(0, 0, "viennaBackground").setOrigin(0, 0);
  const menuButton = this.add.image(30, 30, "menu_icon").setScale(2).setInteractive().on("pointerdown", () => {
      this.scene.start("MainMenuScene");
      this.game.events.emit("cursor:default");
    });

  menuButton.on("pointerover", () => this.game.events.emit("cursor:hover"));
  menuButton.on("pointerout", () => this.game.events.emit("cursor:default"));
    
  const player1Sprite = this.add.sprite(0,0,data.male.texture).play(data.male.anim);
  const player2Sprite = this.add.sprite(15, 0, data.female.texture).play(data.female.anim);

     this.player = this.add.container(width / 2, height / 2 + 20, [
      player1Sprite,
      player2Sprite,
    ]);

    this.player.setScale(4);

    const locationsConfig: LocationConfig[] = [
      { name: "attraction", key: "PraterScene", x: width - 170, y: 250 },
      { name: "albertina",  key: "albertina",  x: 180,          y: 440 , scale: 4},
      { name: "stephan",    key: "stephan",    x: width / 2 + 50,   y: 500 },
      { name: "schonbrun",  key: "schonbrun",  x: 110,         y: 250, scale: 4 },
      { name: "belvedere",  key: "belvedere",  x: width - 130, y: 440, scale:4 },
    ]
    locationsConfig.forEach(({name, key, x, y, scale =5}) => {
      const sprite = this.add.sprite(x, y, `${name}_idle`).play(`${name}_anim`).setScale(scale);
      new GameLocation(this, sprite, {key, data}, this.player);
    })
   
  }
}
