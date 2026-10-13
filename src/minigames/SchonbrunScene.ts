import Phaser from "phaser";
import type { PlayersProps } from "./PraterScene";
import { createInteractiveButton } from "../ui/createInteractiveButton";
import { showNextRoundBanner } from "../ui/nextRound";

export class ShconbrunScene extends Phaser.Scene {
    private roundIndex: number = 0;
    private currentData!: PlayersProps;
    private walls!: Phaser.Physics.Arcade.StaticGroup;
    private goalPlatform!: Phaser.GameObjects.Sprite;
    private groundBg?: Phaser.GameObjects.Rectangle;
    private tileSize = 32;
    private player !: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private isEnd: boolean = false;
    private isRound: boolean = false;
    private wasdkeys!: {
        W: Phaser.Input.Keyboard.Key,
        A: Phaser.Input.Keyboard.Key,
        S: Phaser.Input.Keyboard.Key,
        D: Phaser.Input.Keyboard.Key,
    }
    private spikes: Phaser.GameObjects.Sprite[] = [];
    private spikeTimer?: Phaser.Time.TimerEvent;
    private playerSpeed: number = 140;
    private activeDelayedCalls: Phaser.Time.TimerEvent[] = [];
    // Карта 1 (17x13)
private readonly mazeGrid1: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 4, 0, 1, 0, 0, 1], // шип на проході праворуч
  [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1],
  [1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 3, 4, 1, 0, 1, 0, 1, 1, 0, 1], // шип перед фінішем
  [1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 0, 4, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1], // шип у нижньому коридорі
  [1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Карта 2 (19x15)
private readonly mazeGrid2: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 3, 1, 0, 4, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1], // шип на підході до центру
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 4, 1, 0, 1, 0, 0, 0, 1], // шип біля нижньої петлі
  [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1],
  [1, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // шип на нижній прямій
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Карта 3 (23x17)
private readonly mazeGrid3: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 3, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 4, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1], // шип під фінішем
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 4, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1], // шип у коридорі
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 2, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], // шип одразу біля старту
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Карта 4 (25x21)
private readonly mazeGrid4: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 4, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1], // шип
  [1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 3, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 4, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1], // шип під фінішем
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], // шип у довгому низу
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
  private mazeRounds = [this.mazeGrid1, this.mazeGrid2, this.mazeGrid3, this.mazeGrid4];
    constructor() {
        super({key: "SchonbrunScene"})
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

        this.startRound(this.roundIndex);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
              this.game.events.emit("cursor:default");
              this.clearCurrentMaze();
            });
        
    }

    clearCurrentMaze() {
        if (this.walls) {
    this.walls.destroy(true); // Повністю знищує групу разом із фізичними тілами
  }
        if (this.spikeTimer) {
            this.spikeTimer.destroy();
            this.spikeTimer = undefined;
        }

        this.activeDelayedCalls.forEach((call) => {
            call.destroy();
        })
        this.activeDelayedCalls = [];
        this.spikes.forEach((spike) => {
            spike.destroy();
        })

        this.spikes = [];
        this.groundBg?.destroy();
        this.player?.destroy();
        this.goalPlatform?.destroy();

    }

    startRound(roundIndex: number) {
        this.isRound = false;
        this.roundIndex = roundIndex;

        this.clearCurrentMaze();


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
            0xd2b48c
        );

        this.walls = this.physics.add.staticGroup();
        this.mazeRounds[roundIndex].forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const x = offsetX + colIndex * this.tileSize + this.tileSize / 2;
                const y = offsetY + rowIndex * this.tileSize + this.tileSize /2;

                if (cell === 1) {
                    const hedge = this.add.image(x, y, "bush");
                    this.physics.add.existing(hedge, true);
                    this.walls.add(hedge);
                } 
                else if (cell === 2) {
                    startX = x;
                    startY = y;
                }
                else if (cell === 3) {
                    this.goalPlatform = this.add.sprite(x,y,this.currentData.male.texture);
                    this.physics.add.existing(this.goalPlatform, true);
                }
                else if (cell === 4) {
                    const spike = this.add.sprite(x,y,"spike_idle");
                    this.physics.add.existing(spike, true);
                    spike.setData("isDangerous", false);
                    this.spikes.push(spike);
                }
            })
        });

        this.player = this.physics.add.sprite(startX, startY, this.currentData.female.texture);
        this.player.body?.setSize(20,20);
        this.player.setCollideWorldBounds(true);
        this.spikeTimer = this.time.addEvent({
            delay: 2000,
            loop: true,
            callback: () => {
                this.spikes.forEach((spike) => {
                    spike.play("spikes_pop_up");

                    const dangerousTimer = this.time.delayedCall(150, () => {
                        spike.setData("isDangerous",true);
                    })

                    const retractTimer = this.time.delayedCall(1200, () => {
                        spike.setData("isDangerous", false);
                        spike.play("spikes_retract");
                    });

                    this.activeDelayedCalls.push(dangerousTimer, retractTimer);
                })
            }
        });
        this.spikes.forEach((spike) => {
            this.physics.add.overlap(this.player, spike, () => {
                if (spike.getData("isDangerous")) {
                    this.handleSpikeHit();
                }
            })
        })
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.overlap(this.player, this.goalPlatform, this.onReachGoal, undefined, this);
    }


    handleSpikeHit() {
        if (this.isEnd || this.isRound) return;
        this.isEnd = true;
        this.player.setVelocity(0,0);
        this.add.image(this.scale.width / 2 + 30, 80, "game_over").setScale(5);

        createInteractiveButton(this, 400, 150, "restart", () => {
              this.scene.restart(this.currentData);
            });
        
            createInteractiveButton(this,400, 300, "go_to_map", () => {
              this.scene.start("WorldScene");
           });
    }

    onReachGoal() {
        if (this.isRound || this.isEnd) return;
        this.isRound = true;

        this.player.setVelocity(0,0);
        const nextIndex = this.roundIndex + 1;

        if (nextIndex < this.mazeRounds.length) {
            showNextRoundBanner({
            scene: this,
            nextIndex: nextIndex,
            onStart: (index) => {
                this.startRound(index);
            }
        })
        }
        else {
            this.handleVictory();
        }
    }
    handleVictory() {
        if (this.isEnd) return;
        this.isEnd = true;
        this.player.setVelocity(0,0);
        this.add.image(this.scale.width / 2 + 30, 80, "victory").setScale(5);
        createInteractiveButton(this, 400, 150, "restart", () => {
              this.scene.restart(this.currentData);
            });
        
            createInteractiveButton(this,400, 300, "go_to_map", () => {
              this.scene.start("WorldScene");
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
        }
        else if (this.cursors.right.isDown || this.wasdkeys.D.isDown) {
            vx = this.playerSpeed;
            this.player.setFlipX(false);
            }
        if (this.cursors.up.isDown || this.wasdkeys.W.isDown) {
            vy = -this.playerSpeed;
        }
        else if (this.cursors.down.isDown || this.wasdkeys.S.isDown) {
            vy = this.playerSpeed;
        }

        if (vx !== 0 && vy !== 0) {
            vx *= Math.SQRT1_2;
            vy *= Math.SQRT1_2;
        }

        this.player.setVelocity(vx, vy);
    }
}