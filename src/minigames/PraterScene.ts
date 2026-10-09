import Phaser from "phaser";
import { createInteractiveButton } from "../ui/createInteractiveButton";
export interface PlayerProps {
  name: string;
  texture: string;
  anim: string;
}

export interface PlayersProps {
  male: PlayerProps;
  female: PlayerProps;
}

export type GameMode = "basic" | "medium" | "chaotic";

export interface RoundConfig {
  targetScore: number;
  attempts: number;
  rowsY: number[];
  minDuration: number;
  maxDuration: number;
  gameMode: GameMode;
}

export interface GameBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export class PraterScene extends Phaser.Scene {
  private readonly rounds: readonly RoundConfig[] = [
    {
      targetScore: 3,
      attempts: 8,
      rowsY: [280, 240, 180],
      minDuration: 1200,
      maxDuration: 2000,
      gameMode: "basic",
    },
    {
      targetScore: 4,
      attempts: 9,
      rowsY: [300, 260, 220, 180],
      minDuration: 600,
      maxDuration: 800,
      gameMode: "medium",
    },
    {
      targetScore: 4,
      attempts: 8,
      rowsY: [300, 260, 220, 180],
      minDuration: 500,
      maxDuration: 1000,
      gameMode: "chaotic",
    },
  ];

  private readonly bounds: GameBounds = {
    minX: 340,
    maxX: 660,
    minY: 160,
    maxY: 320,
  };

  private currentData!: PlayersProps;
  private currentRoundIndex: number = 0;
  private score: number = 0;
  private targetScore: number = 0;
  private attempts: number = 0;
  private canThrow: boolean = true;
  private isGameOver: boolean = false;

  private targets: Phaser.GameObjects.Image[] = [];
  private maleSprite!: Phaser.GameObjects.Sprite;
  private femaleSprite!: Phaser.GameObjects.Sprite;

  private scoreTablet!: Phaser.GameObjects.Text;
  private attemptsTablet!: Phaser.GameObjects.Text;
  private roundTablet!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "PraterScene" });
  }

  create(data: PlayersProps): void {
    this.currentData = data;
    this.currentRoundIndex = 0;
    this.isGameOver = false;

    this.setupEnvironment();
    this.setupCharacters();
    this.setupUI();
    this.setupInputs();

    this.startRound(this.currentRoundIndex);
  }

  // --- Ініціалізація сцени ---

  private setupEnvironment(): void {
    this.add.image(0, 0, "attractionBackground").setOrigin(0, 0);
    this.add
      .sprite(500, 250, "target_place_idle")
      .play("target_place_anim")
      .setScale(15);
  }

  private setupCharacters(): void {
    const { male, female } = this.currentData;

    this.maleSprite = this.add
      .sprite(this.scale.width / 2, this.scale.height - 60, `${male.name}_baseball_idle`)
      .play(`${male.name}_baseball_anim`)
      .setScale(9);

    this.femaleSprite = this.add
      .sprite(200, 400, `${female.name}_baseball_idle`)
      .play(`${female.name}_baseball_anim`)
      .setScale(9);
  }

  private setupUI(): void {
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: "22px",
      color: "#ffffff",
    };

    this.scoreTablet = this.add.text(100, 20, "", textStyle);
    this.attemptsTablet = this.add.text(100, 60, "", textStyle);
    this.roundTablet = this.add.text(100, 100, "", textStyle);
    this.add.image(30, 100, "round").setOrigin(0,0);
    this.add.image(30, 60, "attempts").setOrigin(0,0);
    this.add.image(50, 20, "hit").setOrigin(0,0);
  }

  private setupInputs(): void {
    this.input.on("pointerdown", this.handlePointerDown);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off("pointerdown", this.handlePointerDown);
      this.game.events.emit("cursor:default");
      this.clearTargets();
    });
  }

  // --- Логіка раундів ---

  private startRound(roundIndex: number): void {
    const config = this.rounds[roundIndex];
    this.clearTargets();

    this.score = 0;
    this.targetScore = config.targetScore;
    this.attempts = config.attempts;
    this.canThrow = true;

    this.updateHUD();

    config.rowsY.forEach((y) => this.spawnTarget(y, config));
  }

  private spawnTarget(y: number, config: RoundConfig): void {
    const target = this.add.image(this.bounds.minX, y, "target");
    this.targets.push(target);

    const halfW = target.displayWidth * 0.5;
    const halfH = target.displayHeight * 0.5;

    const safeMinX = this.bounds.minX + halfW;
    const safeMaxX = this.bounds.maxX - halfW;
    const safeMinY = this.bounds.minY + halfH;
    const safeMaxY = this.bounds.maxY - halfH;

    target.setX(safeMinX);

    const duration = Phaser.Math.Between(config.minDuration, config.maxDuration);

    switch (config.gameMode) {
      case "chaotic":
        this.setupChaoticMovement(target, y, safeMinX, safeMaxX, safeMinY, safeMaxY, duration);
        break;
      case "medium":
        this.setupMediumMovement(target, y, safeMaxX, safeMinY, safeMaxY, duration);
        break;
      case "basic":
      default:
        this.tweens.add({
          targets: target,
          x: safeMaxX,
          ease: "Sine.easeInOut",
          duration,
          yoyo: true,
          repeat: -1,
        });
        break;
    }
  }

  private setupChaoticMovement(
    target: Phaser.GameObjects.Image,
    y: number,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    duration: number
  ): void {
    const midX = (minX + maxX) / 2;
    const deltaY = 35;

    const topY = Phaser.Math.Clamp(y - deltaY, minY, maxY);
    const bottomY = Phaser.Math.Clamp(y + deltaY, minY, maxY);

    const path = new Phaser.Curves.Path(minX, y);
    path.lineTo(midX, topY);
    path.lineTo(maxX, y);
    path.lineTo(midX, bottomY);
    path.closePath();

    const follower = { t: 0 };
    target.setData("follower", follower);

    const pathTween = this.tweens.add({
      targets: follower,
      t: 1,
      ease: "Linear",
      duration,
      repeat: -1,
      onUpdate: () => {
        if (target.active) {
          const point = path.getPoint(follower.t);
          target.setPosition(point.x, point.y);
        }
      },
    });

    target.setData("pathTween", pathTween);
  }

  private setupMediumMovement(
    target: Phaser.GameObjects.Image,
    y: number,
    safeMaxX: number,
    safeMinY: number,
    safeMaxY: number,
    duration: number
  ): void {
    const sign = Math.random() < 0.5 ? -1 : 1;
    const offset = Phaser.Math.Between(30, 50) * sign;
    const targetY = Phaser.Math.Clamp(y + offset, safeMinY, safeMaxY);

    this.tweens.add({
      targets: target,
      x: safeMaxX,
      y: targetY,
      ease: "Linear",
      duration,
      yoyo: true,
      repeat: -1,
    });
  }

  private clearTargets(): void {
    this.targets.forEach((target) => {
      this.destroyTargetTween(target);
      target.destroy();
    });
    this.targets = [];
  }

  private destroyTargetTween(target: Phaser.GameObjects.Image): void {
    this.tweens.killTweensOf(target);
    const pathTween = target.getData("pathTween") as Phaser.Tweens.Tween | undefined;
    if (pathTween) {
      pathTween.stop();
      pathTween.remove();
    }
  }

  // --- Ігровий процес (Кидок м'яча) ---

  private handlePointerDown = (pointer: Phaser.Input.Pointer): void => {
    if (!this.canThrow || this.isGameOver || this.attempts <= 0) return;

    this.attempts--;
    this.updateHUD();
    this.throwBall(pointer.x, pointer.y);
  };

  private throwBall(targetX: number, targetY: number): void {
    this.canThrow = false;
    const startX = this.scale.width / 2;
    const startY = this.scale.height - 60;

    const ball = this.add
      .sprite(startX, startY, "baseball_idle")
      .play("baseball_anim")
      .setScale(2);

    this.maleSprite.stop().setTexture(`${this.currentData.male.name}_baseball_throw_idle`);

    this.tweens.add({
      targets: ball,
      x: targetX,
      y: targetY - 20,
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
      },
    });
  }

  private checkBallHit(ball: Phaser.GameObjects.Sprite): void {
    const hitRadius = ball.width * 0.5 * ball.scaleX;
    const ballCircle = new Phaser.Geom.Circle(ball.x, ball.y, hitRadius);
    let hit = false;

    for (let i = this.targets.length - 1; i >= 0; i--) {
      const target = this.targets[i];
      if (!target.active) continue;

      if (Phaser.Geom.Intersects.CircleToRectangle(ballCircle, target.getBounds())) {
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

  private hitTarget(target: Phaser.GameObjects.Image, index: number): void {
    this.destroyTargetTween(target);
    this.targets.splice(index, 1);

    this.score++;
    this.updateHUD();

    this.tweens.add({
      targets: target,
      y: target.y + 60,
      angle: 45,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        target.destroy();
        this.checkEndConditions();
      },
    });
  }

  // --- Перевірка стану та переходи ---

  private checkEndConditions(): void {
    if (this.score >= this.targetScore) {
      if (this.currentRoundIndex + 1 < this.rounds.length) {
        this.goToNextRound();
      } else {
        this.finishGame("victory");
      }
      return;
    }

    if (this.attempts <= 0) {
      this.finishGame("game_over");
      return;
    }

    this.canThrow = true;
  }

  private goToNextRound(): void {
    this.canThrow = false;
    this.currentRoundIndex++;

    const roundBanner = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2,
        `Round ${this.currentRoundIndex + 1}!`,
        {
          fontSize: "32px",
          color: "#ffff00",
          stroke: "#000000",
          strokeThickness: 4,
        }
      )
      .setOrigin(0.5);

    this.time.delayedCall(1500, () => {
      roundBanner.destroy();
      this.startRound(this.currentRoundIndex);
    });
  }

  private finishGame(message: "victory" | "game_over"): void {
    this.isGameOver = true;
    this.canThrow = false;

    this.add.image(this.scale.width / 2 + 30, 80, message).setScale(5);

    if (message === "victory") {
      this.registry.set("attraction_idle_completed", true);
      this.femaleSprite.play(`${this.currentData.female.name}_baseball_victory_anim`);
      this.maleSprite.play(`${this.currentData.male.name}_baseball_victory_anim`);
    }

    createInteractiveButton(this, 400, 150, "restart", () => {
      this.scene.restart(this.currentData);
    });

    createInteractiveButton(this,400, 300, "go_to_map", () => {
      this.scene.start("WorldScene");
   });
  }


  private updateHUD(): void {
    this.roundTablet.setText(`${this.currentRoundIndex + 1}/${this.rounds.length}`);
    this.scoreTablet.setText(`${this.score}/${this.targetScore}`);
    this.attemptsTablet.setText(`${this.attempts}`);
  }
}