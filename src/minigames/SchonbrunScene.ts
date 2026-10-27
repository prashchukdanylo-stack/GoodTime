import Phaser from "phaser";
import type { PlayersProps } from "./PraterScene";
import { createInteractiveButton } from "../ui/createInteractiveButton";
import { showNextRoundBanner } from "../ui/nextRound";

import bushImg from "../assets/bush.png";
import snakeIdle from "../assets/snake_idle.png";
import rosesSides from "../assets/roses_sides_idle.png";
import rosesDown from "../assets/roses_down_idle.png";

import lauraWalkRight from "../assets/Laura_walk_right_idle.png";
import lauraWalkDown from "../assets/Laura_walk_down_idle.png";
import lauraWalkUp from "../assets/Laura_walk_up_idle.png";
import lauraIdle from "../assets/Laura_idle.png";

import lilyWalkRight from "../assets/Lily_walk_right_idle.png";
import lilyWalkDown from "../assets/Lily_walk_down_idle.png";
import lilyWalkUp from "../assets/Lily_walk_up_idle.png";
import lilyIdle from "../assets/Lily_idle.png";

import stellaWalkRight from "../assets/Stella_walk_right_idle.png";
import stellaWalkDown from "../assets/Stella_walk_down_idle.png";
import stellaWalkUp from "../assets/Stella_walk_up_idle.png";
import stellaIdle from "../assets/Stella_idle.png";

export class ShconbrunScene extends Phaser.Scene {
  private roundIndex: number = 0;
  private currentData!: PlayersProps;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private goalPlatform!: Phaser.GameObjects.Sprite;
  private groundBg?: Phaser.GameObjects.Rectangle;
  private readonly tileSize = 32;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private isEnd: boolean = false;
  private isRound: boolean = false;
  private wasdkeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private spikes: Phaser.GameObjects.Sprite[] = [];
  private enemies: Phaser.Physics.Arcade.Sprite[] = [];
  private spikeTimer?: Phaser.Time.TimerEvent;
  private readonly playerSpeed: number = 140;
  private readonly enemySpeed: number = 50;
  private activeDelayedCalls: Phaser.Time.TimerEvent[] = [];
  private enemyTimers: Phaser.Time.TimerEvent[] = [];

  private readonly mazeGrid1: number[][] = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 5, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1],
    [1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 3, 0, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 5, 1, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 5, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  private readonly mazeGrid2: number[][] = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 0, 1, 0, 5, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 5, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 5, 1, 3, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 5, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  private readonly mazeGrid3: number[][] = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 5, 0, 1],
    [1, 5, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 5, 0, 1, 0, 0, 0, 1, 5, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 5, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 3, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 5, 0, 0, 0, 0, 1, 0, 0, 5, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  private readonly mazeGrid4: number[][] = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 0, 5, 1, 0, 0, 0, 0, 5, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 5, 0, 1],
    [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 5, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 5, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 5, 0, 5, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 0, 0, 5, 0, 1],
    [1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 5, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 5, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 3, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 5, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 5, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 5, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 5, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 5, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 5, 1, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 5, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  private mazeRounds = [
    this.mazeGrid1,
    this.mazeGrid2,
    this.mazeGrid3,
    this.mazeGrid4,
  ];

  constructor() {
    super({ key: "SchonbrunScene" });
  }

  preload() {
    this.load.image("bush", bushImg);
    this.load.spritesheet("snake_idle", snakeIdle, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("roses_sides_idle", rosesSides, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("roses_down_idle", rosesDown, {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet("Laura_walk_right", lauraWalkRight, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Laura_walk_down", lauraWalkDown, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Laura_walk_up", lauraWalkUp, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Laura_idle", lauraIdle, {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet("Lily_walk_right", lilyWalkRight, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Lily_walk_down", lilyWalkDown, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Lily_walk_up", lilyWalkUp, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Lily_idle", lilyIdle, {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet("Stella_walk_right", stellaWalkRight, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Stella_walk_down", stellaWalkDown, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Stella_walk_up", stellaWalkUp, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Stella_idle", stellaIdle, {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create(data: PlayersProps) {
    this.isEnd = false;
    this.currentData = data;
    this.roundIndex = 0;

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasdkeys = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D,
      }) as any;
    }

    if (!this.anims.exists("snake_anim")) {
      this.anims.create({
        key: "snake_anim",
        frames: this.anims.generateFrameNumbers("snake_idle", {
          start: 0,
          end: 3,
        }),
        frameRate: 6,
        repeat: -1,
      });
    }

    const characters = ["Laura", "Lily", "Stella"];
    characters.forEach((name) => {
      if (!this.anims.exists(`${name}_walk_right_anim`)) {
        this.anims.create({
          key: `${name}_walk_right_anim`,
          frames: this.anims.generateFrameNumbers(`${name}_walk_right`, {
            start: 0,
            end: 3,
          }),
          frameRate: 8,
          repeat: -1,
        });
      }

      if (!this.anims.exists(`${name}_walk_down_anim`)) {
        this.anims.create({
          key: `${name}_walk_down_anim`,
          frames: this.anims.generateFrameNumbers(`${name}_walk_down`, {
            start: 0,
            end: 3,
          }),
          frameRate: 8,
          repeat: -1,
        });
      }
      if (!this.anims.exists(`${name}_walk_up_anim`)) {
        this.anims.create({
          key: `${name}_walk_up_anim`,
          frames: this.anims.generateFrameNumbers(`${name}_walk_up`, {
            start: 0,
            end: 3,
          }),
          frameRate: 8,
          repeat: -1,
        });
      }
    });

    if (!this.anims.exists("roses_sides_anim")) {
      this.anims.create({
        key: "roses_sides_anim",
        frames: this.anims.generateFrameNumbers("roses_sides_idle", {
          start: 0,
          end: 3,
        }),
        frameRate: 3,
        repeat: -1,
      });
      this.anims.create({
        key: "roses_sides_pop_up",
        frames: this.anims.generateFrameNumbers("roses_sides_idle", {
          start: 0,
          end: 3,
        }),
        frameRate: 10,
        repeat: 0,
      });
      this.anims.create({
        key: "roses_sides_retract",
        frames: this.anims.generateFrameNumbers("roses_sides_idle", {
          start: 3,
          end: 0,
        }),
        frameRate: 10,
        repeat: 0,
      });
    }

    if (!this.anims.exists("roses_down_anim")) {
      this.anims.create({
        key: "roses_down_anim",
        frames: this.anims.generateFrameNumbers("roses_down_idle", {
          start: 0,
          end: 3,
        }),
        frameRate: 3,
        repeat: -1,
      });
      this.anims.create({
        key: "roses_down_pop_up",
        frames: this.anims.generateFrameNumbers("roses_down_idle", {
          start: 0,
          end: 3,
        }),
        frameRate: 10,
        repeat: 0,
      });
      this.anims.create({
        key: "roses_down_retract",
        frames: this.anims.generateFrameNumbers("roses_down_idle", {
          start: 3,
          end: 0,
        }),
        frameRate: 10,
        repeat: 0,
      });
    }

    this.startRound(this.roundIndex);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.emit("cursor:default");
      this.clearCurrentMaze();
    });
  }

  clearCurrentMaze() {
    if (this.walls) {
      this.walls.destroy(true);
    }
    if (this.spikeTimer) {
      this.spikeTimer.destroy();
      this.spikeTimer = undefined;
    }

    this.activeDelayedCalls.forEach((call) => {
      call.destroy();
    });
    this.activeDelayedCalls = [];
    this.spikes.forEach((spike) => {
      spike.destroy();
    });
    this.enemies.forEach((enemy) => {
      enemy.destroy();
    });
    this.enemyTimers.forEach((timer) => {
      timer.destroy();
    });
    this.enemyTimers = [];
    this.enemies = [];
    this.spikes = [];
    this.groundBg?.destroy();
    this.player?.destroy();
    this.goalPlatform?.destroy();
  }

  private generateRandomSpikes(
    grid: number[][],
    count: number,
  ): { row: number; col: number }[] {
    const emptyCells: { row: number; col: number }[] = [];
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 0) {
          emptyCells.push({ row: rowIndex, col: colIndex });
        }
      });
    });

    for (let i = emptyCells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = emptyCells[i];
      emptyCells[i] = emptyCells[j];
      emptyCells[j] = temp;
    }
    return emptyCells.slice(0, count);
  }

  private startRound(roundIndex: number) {
    this.isRound = false;
    this.roundIndex = roundIndex;
    this.cameras.main.setZoom(6);

    this.clearCurrentMaze();
    const currentMap = this.mazeRounds[roundIndex].map((row) => [...row]);
    const spikeCount = 15 + roundIndex * 3;
    const randomSpikePositions = this.generateRandomSpikes(
      currentMap,
      spikeCount,
    );

    randomSpikePositions.forEach(({ row, col }) => {
      currentMap[row][col] = 4;
    });
    const mazeWidth = this.mazeRounds[roundIndex][0].length * this.tileSize;
    const mazeHeight = this.mazeRounds[roundIndex].length * this.tileSize;

    const offsetX = (this.scale.width - mazeWidth) / 2;
    const offsetY = (this.scale.height - mazeHeight) / 2;

    let startX = 0;
    let startY = 0;

    this.groundBg = this.add.rectangle(
      offsetX + mazeWidth / 2,
      offsetY + mazeHeight / 2,
      mazeWidth,
      mazeHeight,
      0xd2b48c,
    );

    this.walls = this.physics.add.staticGroup();
    currentMap.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const x = offsetX + colIndex * this.tileSize + this.tileSize / 2;
        const y = offsetY + rowIndex * this.tileSize + this.tileSize / 2;

        if (cell === 1) {
          const hedge = this.add.image(x, y, "bush");
          this.physics.add.existing(hedge, true);
          this.walls.add(hedge);
        } else if (cell === 2) {
          startX = x;
          startY = y;
        } else if (cell === 3) {
          this.goalPlatform = this.add.sprite(
            x,
            y,
            this.currentData.male.texture,
          );
          this.physics.add.existing(this.goalPlatform, true);
        } else if (cell === 4) {
          let spike;
          if (
            currentMap[rowIndex][colIndex - 1] === 1 &&
            currentMap[rowIndex][colIndex + 1] === 1
          )
            spike = this.add
              .sprite(x, y, "roses_sides_idle")
              .play("roses_sides_anim");
          else
            spike = this.add
              .sprite(x, y, "roses_down_idle")
              .play("roses_down_anim");
          this.physics.add.existing(spike, true);
          spike.setData("isDangerous", false);
          this.spikes.push(spike);
        } else if (cell === 5) {
          const enemy = this.physics.add
            .sprite(x, y, "snake_idle")
            .play("snake_anim")
            .setScale(0.8, 0.8);

          enemy.body.setSize(20, 18);
          const directions = [
            { x: -1, y: -1 },
            { x: 0, y: -1 },
            { x: 1, y: -1 },
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: -1, y: 1 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
          ];

          const setRandomDirection = () => {
            const dir =
              directions[Math.floor(Math.random() * directions.length)];
            dir.x === -1 ? enemy.setFlipX(true) : enemy.setFlipX(false);
            enemy.setVelocity(this.enemySpeed * dir.x, this.enemySpeed * dir.y);
          };

          setRandomDirection();
          enemy.setBounce(1, 1);
          this.enemies.push(enemy);

          const enemyTimer = this.time.addEvent({
            delay: Phaser.Math.Between(2000, 4000),
            loop: true,
            callback: setRandomDirection,
          });
          this.enemyTimers.push(enemyTimer);
        }
      });
    });

    this.player = this.physics.add
      .sprite(startX, startY, this.currentData.female.texture)
      .play(this.currentData.female.anim);

    if (this.player.body) {
      const hitBoxWidth = 10;
      const hitBoxHeight = 8;
      const offsetX = (this.player.width - hitBoxWidth) / 2;
      const offsetY = this.player.height - hitBoxHeight - 2;

      this.player.body.setSize(hitBoxWidth, hitBoxHeight);
      this.player.body.setOffset(offsetX, offsetY);
    }
    this.player.setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player);

    this.spikeTimer = this.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => {
        this.spikes.forEach((spike) => {
          const texture = spike.texture.key.replace("_idle", "");
          spike.play(`${texture}_pop_up`);

          const dangerousTimer = this.time.delayedCall(150, () => {
            spike.setData("isDangerous", true);
          });

          const retractTimer = this.time.delayedCall(1200, () => {
            spike.setData("isDangerous", false);
            spike.play(`${texture}_retract`);
          });

          this.activeDelayedCalls.push(dangerousTimer, retractTimer);
        });
      },
    });

    this.physics.add.overlap(this.player, this.spikes, (_, spikeObj) => {
      const spike = spikeObj as Phaser.GameObjects.Sprite;
      if (spike.getData("isDangerous")) {
        this.handleSpikeHit();
      }
    });

    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.overlap(this.player, this.enemies, () =>
      this.handleSpikeHit(),
    );

    this.physics.add.overlap(
      this.player,
      this.goalPlatform,
      this.onReachGoal,
      undefined,
      this,
    );
  }

  SetDefaultCamera() {
    this.cameras.main.setZoom(1).stopFollow();
    this.cameras.main.scrollX = 0;
    this.cameras.main.scrollY = 0;
  }

  handleSpikeHit() {
    if (this.isEnd || this.isRound) return;
    this.isEnd = true;
    this.player.setVelocity(0, 0);
    this.SetDefaultCamera();
    this.add.image(this.scale.width / 2 + 30, 80, "game_over").setScale(5);

    createInteractiveButton(this, 400, 150, "restart", () => {
      this.clearCurrentMaze();
      this.scene.restart(this.currentData);
    });

    createInteractiveButton(this, 400, 300, "go_to_map", () => {
      this.scene.start("WorldScene", this.currentData);
    });
  }

  onReachGoal() {
    if (this.isRound || this.isEnd) return;
    this.isRound = true;
    this.SetDefaultCamera();
    this.player.setVelocity(0, 0);
    const nextIndex = this.roundIndex + 1;

    if (nextIndex < this.mazeRounds.length) {
      showNextRoundBanner({
        scene: this,
        nextIndex: nextIndex,
        onStart: (index) => {
          this.startRound(index);
        },
      });
    } else {
      this.handleVictory();
    }
  }

  handleVictory() {
    if (this.isEnd) return;
    this.isEnd = true;
    this.player.setVelocity(0, 0);
    this.add.image(this.scale.width / 2 + 30, 80, "victory").setScale(5);

    createInteractiveButton(this, 400, 150, "restart", () => {
      this.scene.restart(this.currentData);
    });

    createInteractiveButton(this, 400, 300, "go_to_map", () => {
      this.scene.start("WorldScene", this.currentData);
    });

    this.registry.set("schonbrun_idle_completed", true);
  }

  override update() {
    if (!this.player || !this.cursors || this.isRound || this.isEnd) return;

    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasdkeys.A.isDown) {
      vx = -this.playerSpeed;
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown || this.wasdkeys.D.isDown) {
      vx = this.playerSpeed;
      this.player.setFlipX(false);
    }
    if (this.cursors.up.isDown || this.wasdkeys.W.isDown) {
      vy = -this.playerSpeed;
    } else if (this.cursors.down.isDown || this.wasdkeys.S.isDown) {
      vy = this.playerSpeed;
    }

    if (vx !== 0 && vy !== 0) {
      vx *= Math.SQRT1_2;
      vy *= Math.SQRT1_2;
    }

    this.player.setVelocity(vx, vy);

    const animKey = `${this.currentData.female.name}_walk_right_anim`;
    if (vx !== 0) {
      if (vx < 0) {
        this.player.setFlipX(true);
      } else if (vx > 0) {
        this.player.setFlipX(false);
      }

      this.player.play(animKey, true);
    } else if (vy !== 0) {
      if (vy > 0) {
        this.player.play(
          `${this.currentData.female.name}_walk_down_anim`,
          true,
        );
      } else {
        this.player.play(`${this.currentData.female.name}_walk_up_anim`, true);
      }
    } else {
      this.player.stop();
      this.player.play(this.currentData.female.anim, true);
    }
  }
}
