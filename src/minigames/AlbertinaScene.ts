import Phaser from "phaser";
import type { PlayersProps } from "./PraterScene";
import { createInteractiveButton } from "../ui/createInteractiveButton";

export class AlbertinaScene extends Phaser.Scene {
  private currentData!: PlayersProps;
  private readonly totalPieces = 4;
  private pieces: Phaser.GameObjects.Sprite[] = [];
  private placedCounts = 0;
  private obstacles: Phaser.Physics.Arcade.Sprite[] = [];
  private isGameOver = false;
  constructor() {
    super({ key: "AlbertinaScene" });
  }
  create(data: PlayersProps) {
    this.currentData = data;
    this.isGameOver = false;
    this.placedCounts = 0;
    this.pieces = [];
    this.obstacles = [];

    const { width, height } = this.scale;

    const startX = width * 0.45;
    const startY = height * 0.4;
    const pieceSize = 100;
    this.add
      .image(0, 0, "albertinaBackground")
      .setOrigin(0, 0)
      .setDisplaySize(width, height);

    for (let i = 0; i < this.totalPieces; i++) {
      const correctX = startX + (i % 2) * pieceSize;
      const correctY = startY + Math.floor(i / 2) * pieceSize;

      const spawnX = Phaser.Math.Between(width * 0.3, width * 0.7);
      const spawnY = height * 0.8;

      const piece = this.add.sprite(spawnX, spawnY, `albertina_piece${i + 1}`);
      piece.setDisplaySize(pieceSize, pieceSize);
      piece.setInteractive({ draggable: true });

      piece.setData("correctX", correctX);
      piece.setData("correctY", correctY);
      piece.setData("isPlaced", false);

      this.pieces.push(piece);
    }

    this.input.on(
      "drag",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.Sprite,
        dragX: number,
        dragY: number,
      ) => {
        if (this.isGameOver) return;
        if (!gameObject.getData("isPlaced")) {
            gameObject.setPosition(dragX, dragY);
        }
      },
    );

    this.input.on("dragend", (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite) => {
        if (this.isGameOver) return;

        const correctX = gameObject.getData("correctX");
        const correctY = gameObject.getData("correctY");

        if (Phaser.Math.Distance.Between(gameObject.x, gameObject.y, correctX, correctY) < 30) {
            gameObject.setPosition(correctX, correctY);
            gameObject.disableInteractive();
            gameObject.setData("isPlaced", true);
            this.placedCounts++;
        }
    })
  }
}
