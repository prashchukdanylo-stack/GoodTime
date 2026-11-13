import Phaser from "phaser";

import viennaBackground from "./assets/viennaBackground.png";
import menuIcon from "./assets/menu_icon.png";
import coin from "./assets/coin.png";

import attractionIdle from "./assets/attraction_idle.png";
import albertinaIdle from "./assets/albertina_idle.png";
import stephanIdle from "./assets/stephan_idle.png";
import schonbrunIdle from "./assets/schonbrun_idle.png";
import belvedereIdle from "./assets/belvedere_idle.png";

import { isCompleted, loadProgress } from "./progress";

interface PlayerProps {
  name: string;
  texture: string;
  anim: string;
}

export interface PlayersProps {
  male: PlayerProps;
  female: PlayerProps;
}

interface LocationConfig {
  name: string;
  targetScene: string;
  x: number;
  y: number;
  scale?: number;
}

class GameLocation {
  private targetSceneKey: string;
  private playerData: PlayersProps;
  private scene: Phaser.Scene;
  public sprite: Phaser.GameObjects.Sprite;
  private target: Phaser.GameObjects.Container;
  private speed: number;
  private starIcon?: Phaser.GameObjects.Image;

  constructor(
    scene: Phaser.Scene,
    sprite: Phaser.GameObjects.Sprite,
    targetSceneKey: string,
    playerData: PlayersProps,
    target: Phaser.GameObjects.Container,
    speed: number = 200,
  ) {
    this.scene = scene;
    this.sprite = sprite;
    this.speed = speed;
    this.targetSceneKey = targetSceneKey;
    this.playerData = playerData;
    this.target = target;

    this.sprite.setInteractive();
    this.sprite.on("pointerdown", this.moveToLocation, this);
    this.sprite.on("pointerover", () =>
      this.scene.game.events.emit("cursor:hover"),
    );
    this.sprite.on("pointerout", () =>
      this.scene.game.events.emit("cursor:default"),
    );
  }

  public refresh(): void {
    if (!this.sprite.active) return;
    if (
      isCompleted(this.scene.registry, this.targetSceneKey) &&
      !this.starIcon
    ) {
      this.createStar();
    }
  }
  private moveToLocation(): void {
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
        localStorage.setItem("lastScene", this.targetSceneKey);
        this.scene.scene.start(this.targetSceneKey, this.playerData);
      },
    });
  }

  private createStar() {
    this.starIcon = this.scene.add
      .image(this.sprite.x - 50, this.sprite.y + 40, "coin")
      .setScale(2);
  }
}

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: "WorldScene" });
  }

  preload() {
    this.load.image("viennaBackground", viennaBackground);
    this.load.image("menu_icon", menuIcon);
    this.load.image("coin", coin);

    this.load.spritesheet("attraction_idle", attractionIdle, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("albertina_idle", albertinaIdle, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("stephan_idle", stephanIdle, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("schonbrun_idle", schonbrunIdle, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("belvedere_idle", belvedereIdle, {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  async create(data: PlayersProps) {
    const { width, height } = this.scale;

    const locationsToAnims = [
      "attraction",
      "albertina",
      "stephan",
      "schonbrun",
      "belvedere",
    ];
    locationsToAnims.forEach((name) => {
      const animKey = `${name}_anim`;
      if (!this.anims.exists(animKey)) {
        this.anims.create({
          key: animKey,
          frames: this.anims.generateFrameNumbers(`${name}_idle`, {
            start: 0,
            end: 3,
          }),
          frameRate: 5,
          repeat: -1,
        });
      }
    });

    this.add
      .image(0, 0, "viennaBackground")
      .setOrigin(0, 0)
      .setDisplaySize(width, height);

    const menuButton = this.add
      .image(width * 0.04, height * 0.06, "menu_icon")
      .setScale(2)
      .setInteractive()
      .on("pointerdown", () => {
        localStorage.setItem("lastScene", "MainMenuScene");
        this.scene.start("MainMenuScene");
        this.game.events.emit("cursor:default");
      });

    menuButton.on("pointerover", () => this.game.events.emit("cursor:hover"));
    menuButton.on("pointerout", () => this.game.events.emit("cursor:default"));

    const playerMale = data?.male || {
      texture: "Greg_idle",
      anim: "Greg_anim",
    };
    const playerFemale = data?.female || {
      texture: "Laura_idle",
      anim: "Laura_anim",
    };

    const player1Sprite = this.add
      .sprite(0, 0, playerMale.texture)
      .play(playerMale.anim);
    const player2Sprite = this.add
      .sprite(15, 0, playerFemale.texture)
      .play(playerFemale.anim);

    this.player = this.add.container(width / 2, height / 2 + 20, [
      player1Sprite,
      player2Sprite,
    ]);

    this.player.setScale(4);

    const locationsConfig: LocationConfig[] = [
      {
        name: "attraction",
        targetScene: "PraterScene",
        x: width * 0.82,
        y: height * 0.35,
      },
      {
        name: "albertina",
        targetScene: "AlbertinaScene",
        x: width * 0.2,
        y: height * 0.7,
      },
      {
        name: "stephan",
        targetScene: "StephanScene",
        x: width * 0.57,
        y: height * 0.8,
      },
      {
        name: "schonbrun",
        targetScene: "SchonbrunScene",
        x: width * 0.12,
        y: height * 0.4,
      },
      {
        name: "belvedere",
        targetScene: "BelvedereScene",
        x: width * 0.85,
        y: height * 0.7,
      },
    ];

    const locations = locationsConfig.map(
      ({ name, targetScene, x, y, scale = 9 }) => {
        const sprite = this.add
          .sprite(x, y, `${name}_idle`)
          .play(`${name}_anim`)
          .setScale(scale);
        const location = new GameLocation(
          this,
          sprite,
          targetScene,
          data,
          this.player,
        );
        location.refresh(); // якщо прогрес уже в registry
        return location;
      },
    );

    await loadProgress(this.registry); // один раз за сесію, далі миттєво
    locations.forEach((l) => l.refresh()); // додає зірки після завантаження
  }
}
