import Phaser from "phaser";
import player1Idle from "./assets/player_idle.png";
import player2Idle from "./assets/player2_idle.png";

export class CharactersScene extends Phaser.Scene {
  constructor() {
    super({ key: "CharactersScene" });
  }

  preload() {
    this.load.spritesheet("player1_idle", player1Idle, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("player2_idle", player2Idle, {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    this.add.text(200, 200, "Choose your characters!!!", { fontSize: "32px" });

    this.anims.create({
      key: "idleAnim",
      frames: this.anims.generateFrameNumbers("player1_idle", {
        start: 0,
        end: 3,
      }),
      frameRate: 4,
      repeat: -1,
    });
    this.anims.create({
      key: "idleAnim2",
      frames: this.anims.generateFrameNumbers("player2_idle", {
        start: 0,
        end: 3,
      }),
      frameRate: 4,
      repeat: -1,
    });

    const maleCharacters = [
      { name: "Danya", texture: "player1_idle", anim: "idleAnim" }
    ];
    const femaleCharacters = [
        {name: "Nastya", texture: "player2_idle", anim: "idleAnim2"}
    ]

    const selectedMaleChar = maleCharacters[0];
    const selectedFemaleChar = femaleCharacters[0];
    const preview1 = this.add.sprite(200, 400, selectedMaleChar.texture).play(selectedMaleChar.anim).setScale(6);
    this.add.text(200, 500, selectedMaleChar.name);
    const preview2 = this.add.sprite(700, 400, selectedFemaleChar.texture).play(selectedFemaleChar.anim).setScale(6);
    this.add.text(700, 500, selectedFemaleChar.name);

    const confirm = this.add.text(500, 300, "Confirm").setInteractive({useHandCursor: true});
    confirm.on("pointerdown", () => {
        this.scene.start("WorldScene"); 
    })
  }
}
