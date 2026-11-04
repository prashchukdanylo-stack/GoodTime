import Phaser from "phaser";
import type { PlayersProps } from "./PraterScene";
import { createInteractiveButton } from "../ui/createInteractiveButton";
import { showNextRoundBanner } from "../ui/nextRound";
import { completeLevel } from "../ui/completeLevel";

import albertinaBackground from "../assets/albertinaBackground.png";
import brush from "../assets/brush.png";

const pieceModules = [
  import.meta.glob("../assets/pieces1/*.jpg", { eager: true, query: "?url", import: "default" }),
  import.meta.glob("../assets/pieces2/*.jpg", { eager: true, query: "?url", import: "default" }),
  import.meta.glob("../assets/pieces3/*.jpg", { eager: true, query: "?url", import: "default" })
];

export class AlbertinaScene extends Phaser.Scene {
  private currentData!: PlayersProps;
  private totalPieces = 25;
  private gridCols = 5; 
  private gridRows = 5; 
  private readonly totalRounds = 3;
  private currentRound = 0;
  private pieces: Phaser.GameObjects.Image[] = [];
  private placedCounts = 0;
  private isGameOver = false;
  private enemies!: Phaser.Physics.Arcade.Group;

  private readonly canvasMinX = 708;
  private readonly canvasMinY = 224;
  private readonly canvasWidth = 442;
  private readonly canvasHeight = 296;

  constructor() {
    super({ key: "AlbertinaScene" });
  }

  preload() {
    
    this.load.image("albertinaBackground", albertinaBackground);
    this.load.spritesheet("brush", brush, {frameWidth:32, frameHeight:32});

    pieceModules.forEach((modules, roundIndex) => {
      Object.entries(modules).forEach(([filePath, url]) => {
        const fileName = filePath.split("/").pop()?.replace(/\.[^/.]+$/, "") || "";
        this.load.image(`${roundIndex}_${fileName}`, url);
      });
    });
  }

  create(data: PlayersProps) {
    this.currentData = data;
    this.currentRound = 0;
    this.isGameOver = false;
    this.placedCounts = 0;
    this.pieces = [];

    const { width, height } = this.scale;


    this.add
      .image(0, 0, "albertinaBackground")
      .setOrigin(0, 0)
      .setDisplaySize(width, height);


    this.enemies = this.physics.add.group();

    this.anims.create({
      key: "brush_anim",
      frames: this.anims.generateFrameNumbers("brush", {start:0, end:7}),
      frameRate:5,
      repeat:-1,
    })
    
    this.startRound(this.currentRound);
    this.handleVictory();
   
    this.input.on(
      "drag",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject,
        dragX: number,
        dragY: number,
      ) => {
        if (this.isGameOver) return;
        
        if (gameObject.data && !gameObject.getData("isPlaced")) {
          (gameObject as Phaser.GameObjects.Image).setPosition(dragX, dragY);
        }
      },
    );

    
    this.input.on("dragend", (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      if (this.isGameOver) return;
      if (!gameObject.data) return;

      const imgObject = gameObject as Phaser.GameObjects.Image;
      const correctX = imgObject.getData("correctX");
      const correctY = imgObject.getData("correctY");

      if (Phaser.Math.Distance.Between(imgObject.x, imgObject.y, correctX, correctY) < 30) {
        imgObject.setPosition(correctX, correctY);
        imgObject.disableInteractive();
        imgObject.setData("isPlaced", true);
        this.placedCounts++;
        if (this.placedCounts%(4 -this.currentRound)===0)this.createEnemy();

        if (this.placedCounts >= this.totalPieces) {
          this.clearArt();

          if (this.currentRound + 1 < this.totalRounds) {
            this.currentRound++;
            this.goToNextRound();
          } else {
            this.handleVictory();
          }
        }
      }
    });
  }


  update(time: number, delta: number): void {
    if (this.isGameOver) return;

    const pointer = this.input.activePointer;
    const enemiesChildren = this.enemies.getChildren() as Phaser.Physics.Arcade.Sprite[];

    for (const enemy of enemiesChildren) {
      const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, enemy.x, enemy.y);
      if (distance < (enemy.displayWidth/2)) {
        this.handleGameOver();
        break;
      }
    }
  }

  private startRound(roundIndex: number): void {


    this.placedCounts = 0;
    const gridCols = this.gridCols + roundIndex;
    const gridRows = this.gridRows + roundIndex;
    const pieceWidth = this.canvasWidth / gridCols;   
    const pieceHeight = this.canvasHeight / gridRows;
    this.totalPieces = gridCols * gridRows;

    for (let i = 0; i < this.totalPieces; i++) {
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);

      const correctX = this.canvasMinX + col * pieceWidth + pieceWidth / 2;
      const correctY = this.canvasMinY + row * pieceHeight + pieceHeight / 2;

      const spawnX = Phaser.Math.Between(this.scale.width * 0.25, this.scale.width * 0.75);
      const spawnY = this.scale.height * 0.85;


      const textureKey = `${roundIndex}_${i}`; 

      const piece = this.add.image(spawnX, spawnY, textureKey);
      piece.setDisplaySize(pieceWidth, pieceHeight);
      piece.setInteractive({ draggable: true });

      piece.setData("correctX", correctX);
      piece.setData("correctY", correctY);
      piece.setData("isPlaced", false);

      this.pieces.push(piece);
    }
  }

  private createEnemy() {

    
      const x = Phaser.Math.Between(100, this.scale.width - 100);
      const y = Phaser.Math.Between(100, this.scale.height - 100);

      const enemy = this.enemies.create(x,y, "brush") as Phaser.Physics.Arcade.Sprite;
      enemy.setDisplaySize(80,80);
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1,1);
      enemy.play("brush_anim");

      const speed = 600;
      const angle = Phaser.Math.Between(0, Math.PI * 2);
      enemy.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

      this.time.addEvent({
        delay: Phaser.Math.Between(2000, 4000),
        loop: true,
        callback: () => {
          if (this.isGameOver || !enemy.active) return;
          const newAngle = Phaser.Math.Between(0, Math.PI * 2);
          enemy.setVelocity(Math.cos(newAngle) * speed, Math.sin(newAngle) * speed);
        }
      })
     
  }

  private goToNextRound() {
    showNextRoundBanner({
      scene: this, 
      nextIndex: this.currentRound, 
      onStart: (index) => {
        this.startRound(index);
      }
    });
  }

  private clearArt() {
    this.pieces.forEach((piece) => {
      piece.destroy();
    });
    this.pieces = [];

    this.enemies.clear(true, true);
  }

  private handleGameOver(): void {
    this.isGameOver = true;
    this.enemies.getChildren().forEach((enemy: any)=> {
        enemy.setVelocity(0,0);
    });
    this.add.image(this.scale.width/2, this.scale.height/2, "game_over").setScale(3);

    createInteractiveButton(this, this.scale.width * 0.1, this.scale.height * 0.1, "go_to_map", () => {
      this.scene.start("WorldScene", this.currentData);
    });
    createInteractiveButton(this, this.scale.width * 0.1, this.scale.height * 0.3, "restart", () => {
      this.scene.restart(this.currentData);
    })
  }

  private handleVictory(): void {
    this.isGameOver = true;
    this.add.image(this.scale.width / 2, this.scale.height / 2, "victory").setScale(3);
    
    createInteractiveButton(this, this.scale.width * 0.1, this.scale.height * 0.1, "go_to_map", () => {
      this.scene.start("WorldScene", this.currentData);
    });
    
    this.registry.set("AlbertinaScene_completed", true);
    completeLevel("AlbertinaScene");
  }

}