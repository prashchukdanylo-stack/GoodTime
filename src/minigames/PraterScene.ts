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

export class PraterScene extends Phaser.Scene {
  private score: number = 0;
  private readonly targetScore: number = 4;
  private targets: Phaser.GameObjects.Image[] = [];
  private scoreTablet !: Phaser.GameObjects.Text;
  private attemptsTablet !: Phaser.GameObjects.Text;
  private restartButton !: Phaser.GameObjects.Text;
  private canThrow: boolean = true;
  private attempts: number = 10;
  private isGameOver: boolean = false;
  private maleSprite!: Phaser.GameObjects.Sprite;
  private femaleSprite!: Phaser.GameObjects.Sprite;
  private currentData!: playersProps;
  constructor() {
    super({ key: "PraterScene" });
  }
  create(data: playersProps) {
    this.currentData = data;
    this.attempts = 10;
    this.score = 0;
    this.targets = [];
    this.canThrow = true;
    this.isGameOver = false;
    this.restartButton?.on('pointerover', () => this.game.events.emit("cursor:hover"));
    this.restartButton?.on('pointerout', () => this.game.events.emit("cursor:default"));
    
    const rowsY = [300, 260, 220, 180];
    this.add.image(0, 0, "attractionBackground").setOrigin(0, 0);
    this.add.sprite(500,250, "target_place_idle").play("target_place_anim").setScale(15);
    console.log(data.male.texture);
    this.maleSprite = this.add.sprite(this.scale.width/2,this.scale.height - 60, `${data.male.name}_baseball_idle`).play(`${data.male.name}_baseball_anim`).setScale(9);
     this.femaleSprite = this.add.sprite(200,400, `${data.female.name}_baseball_idle`).play(`${data.female.name}_baseball_anim`).setScale(9);
    this.scoreTablet = this.add.text(
      40,
      20,
      `Stroke 0/${this.targetScore} of targets.`,
      {
        fontSize: "22px",
        color: "#ffffff",
      },
    );
    this.attemptsTablet = this.add.text(
      40,
      100,
      `Attempts left: ${this.attempts}`,
      {
        fontSize: "22px",
        color: "#ffffff",
      },
    );

    rowsY.forEach((y) => {
      const startX = 340;
      const target = this.add.image(startX, y, "target");
      this.targets.push(target);

    
      const duration = Phaser.Math.Between(600, 2000);

      this.tweens.add({
        targets: target,
        x: 660,
        ease: "Sine.easeInOut",
        duration: duration,
        yoyo: true,
        repeat: -1,
      });
    }
  
     
  
  );


  this.input.on("pointerdown", this.handlePointerDown);

  this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    this.input.off("pointerdown", this.handlePointerDown, this);
    this.game.events.emit("cursor:default");
  })

  }


  private handlePointerDown = (pointer: Phaser.Input.Pointer) => {
    if (!this.canThrow || this.isGameOver || this.attempts <= 0) return;


    this.attempts--;
    this.attemptsTablet.setText(`Attempts left: ${this.attempts}`);
    this.throwBall(pointer.x, pointer.y);
  }

  private throwBall(targetX:number, targetY:number) {
    this.canThrow = false;
    const startX = this.scale.width/2;
    const startY = this.scale.height - 60;
    const ball = this.add.sprite(startX, startY, "baseball_idle").play("baseball_anim").setScale(2);
    this.maleSprite.stop().setTexture(`${this.currentData.male.name}_baseball_throw_idle`);

    const destinationY = targetY - 20;

    this.tweens.add({
      targets: ball,
      x: targetX,
      y: destinationY,
      scale: 0.45,
      ease: "Quad.easeOut",
      duration: 450,
      onComplete: () => {
        this.checkBallHit(ball);
        this.time.delayedCall(20, () => {
        if (!this.isGameOver) {
          this.maleSprite.play(`${this.currentData.male.name}_baseball_anim`);
        }
      });
      }
      
    });
  }

  private checkBallHit(ball: Phaser.GameObjects.Sprite) {
    
    const hitRadius = ball.width * 0.5 * ball.scaleX;
    const ballCircle = new Phaser.Geom.Circle(ball.x, ball.y, hitRadius);
    let hit = false;

    for (let i = this.targets.length - 1; i >= 0; i--) {
      const target = this.targets[i];
      if (!target.active) continue;

      const targetBounds = target.getBounds();

      if (Phaser.Geom.Intersects.CircleToRectangle(ballCircle, targetBounds)) {
        this.hitTarget(target, i);
        hit = true;
        break;
      }
    }
    ball.destroy();
    

    if (!hit) {
      this.checkEndConditions();
    }
  }

  private hitTarget(target: Phaser.GameObjects.Image, index: number) {
    this.tweens.killTweensOf(target);

    this.targets.splice(index, 1);
    this.score++;
    this.scoreTablet.setText(`Hit: ${this.score}/ ${this.targetScore}`);

    this.tweens.add({
      targets: target,
      y: target.y + 60,
      angle: 45,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        target.destroy();
        this.checkEndConditions();
      }
    })
  }

  private checkEndConditions() {
    if (this.score >= this.targetScore) {
        this.finishGame("victory");
        return;
    }
    if (this.attempts <= 0) {
      this.isGameOver = true;
      this.canThrow = false;

      this.finishGame("game_over");
      return;
    }
    this.canThrow = true;
  }

  private finishGame(message: string) {
    this.add.image(this.scale.width / 2 + 30, 80, message).setScale(5);
    if (message === "victory") {
      this.femaleSprite.play(`${this.currentData.female.name}_baseball_victory_anim`);
      this.maleSprite.play(`${this.currentData.male.name}_baseball_victory_anim`);
    }
    this.restartButton = this.add.text(40, 250, "Restart");
    this.restartButton.setInteractive();
    this.restartButton.on('pointerdown', () => {
      this.scene.restart();
    });
    this.restartButton.on('pointerover', () => this.game.events.emit("cursor:hover"));
    this.restartButton.on('pointerout', () => this.game.events.emit("cursor:default"));
    const returnButton = this.add.text(40, 300, "Return to Vienna", {
      fontSize: '20px',
      color: '#ffffff',
    });
    returnButton.setInteractive();
    returnButton.on('pointerdown', () => {
      this.scene.start("WorldScene");
    });
    
    returnButton.on('pointerover', () => this.game.events.emit("cursor:hover"));
    returnButton.on('pointerout', () => this.game.events.emit("cursor:default"));
  }
}
