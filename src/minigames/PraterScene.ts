import Phaser from "phaser";

export class PraterScene extends Phaser.Scene {
  private score: number = 0;
  private readonly targetScore: number = 4;
  private targets: Phaser.GameObjects.Image[] = [];
  private scoreTablet !: Phaser.GameObjects.Text;
  private attemptsTablet !: Phaser.GameObjects.Text;
  private canThrow: boolean = true;
  private attempts: number = 10;
  private isGameOver: boolean = false;
  constructor() {
    super({ key: "PraterScene" });
  }
  create() {
    this.attempts = 10;
    this.score = 0;
    this.targets = [];
    this.canThrow = true;
    this.isGameOver = false;
  
    const rowsY = [300, 260, 220, 180];
    this.add.image(0, 0, "attractionBackground").setOrigin(0, 0);
    this.add.sprite(500,250, "target_place_idle").play("target_place_anim").setScale(15);

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
    const ball = this.add.circle(startX, startY, 18, 0xffcc00);

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
      }
      
    });
  }

  private checkBallHit(ball: Phaser.GameObjects.Arc) {
    
    const hitRadius = ball.radius * ball.scaleX;
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
        this.add.text(40, 200, "Victory!", {
            fontSize:'26px',
            color: '#00ff00',
        })
        return;
    }

    if (this.attempts <= 0) {
      this.isGameOver = true;
      this.canThrow = false;

      const loseText = this.add.text(40, 200, "Game Over!", {
        fontSize: '26px',
        color: '#ff0000',
      }).setInteractive();

      loseText.on('pointerdown', () => {
        this.scene.restart();
      });
      return;
    }
    this.canThrow = true;
  }
}
