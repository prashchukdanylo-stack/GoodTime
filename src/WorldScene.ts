import Phaser from "phaser";

interface playerProps {
  name: string,
  texture: string,
  anim: string
}
interface playersProps {
  male: playerProps,
  female: playerProps
}

interface LocationConfig {
  name: string,
  key: string,
  x: number,
  y: number,
  scale?: number
}



class GameLocation {
      private data:object;
     private scene: Phaser.Scene;
      public sprite: Phaser.GameObjects.Sprite;
      private target: Phaser.GameObjects.Container;
      private speed: number;
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

        this.sprite.setInteractive({ useHandCursor: true });
        this.sprite.on("pointerdown", this.moveToLocation, this);
      }

      private moveToLocation():void {
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
    }
   
    

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  constructor() {
    super({ key: "WorldScene" });
    
  }
  
  create(data:playersProps) {
    const { width, height } = this.scale;

    this.add.text(width * 0.4, height * 0.1, "Vienna", {
      color: "#c91d1d",
      fontSize: "32px",
    });

  const player1Sprite = this.add.sprite(0,0,data.male.texture).play(data.male.anim);
  const player2Sprite = this.add.sprite(15, 0, data.female.texture).play(data.female.anim);

     this.player = this.add.container(width / 2, height / 2, [
      player1Sprite,
      player2Sprite,
    ]);

    this.player.setScale(4);

    const locationsConfig: LocationConfig[] = [
      { name: "attraction", key: "attraction", x: width - 130, y: 210 },
      { name: "albertina",  key: "albertina",  x: 90,          y: 400 },
      { name: "stephan",    key: "stephan",    x: width / 2,   y: 500 },
      { name: "schonbrun",  key: "schonbrun",  x: 130,         y: 200 },
      { name: "belvedere",  key: "belvedere",  x: width - 110, y: 400 },
    ]
    locationsConfig.forEach(({name, key, x, y, scale =5}) => {
      const sprite = this.add.sprite(x, y, `${key}_idle`).play(`${key}_anim`).setScale(scale);
      new GameLocation(this, sprite, {name}, this.player);
    })
   
  }
}
