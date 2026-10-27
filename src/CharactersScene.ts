import Phaser from "phaser";
import { createInteractiveButton } from "./ui/createInteractiveButton";

import homeBackground from "./assets/homeBackground.png";
import arrowLeft from "./assets/arrowLeft_idle.png";
import arrowRight from "./assets/arrowRight_idle.png";
import confirm from "./assets/confirm.png";


import gregIdle from "./assets/Greg_idle.png";
import damonIdle from "./assets/Damon_idle.png";
import tomIdle from "./assets/Tom_idle.png";
import gregName from "./assets/Greg_name.png";
import damonName from "./assets/Damon_name.png";
import tomName from "./assets/Tom_name.png";


import lauraIdle from "./assets/Laura_idle.png";
import lilyIdle from "./assets/Lily_idle.png";
import stellaIdle from "./assets/Stella_idle.png";
import lauraName from "./assets/Laura_name.png";
import lilyName from "./assets/Lily_name.png";
import stellaName from "./assets/Stella_name.png";

const maleCharacters = [
  { name: "Greg", texture: "Greg_idle", anim: "Greg_anim", nameImg: "Greg_name" },
  { name: "Damon", texture: "Damon_idle", anim: "Damon_anim", nameImg: "Damon_name" },
  { name: "Tom", texture: "Tom_idle", anim: "Tom_anim", nameImg: "Tom_name" },
];

const femaleCharacters = [
  { name: "Laura", texture: "Laura_idle", anim: "Laura_anim", nameImg: "Laura_name" },
  { name: "Lily", texture: "Lily_idle", anim: "Lily_anim", nameImg: "Lily_name" },
  { name: "Stella", texture: "Stella_idle", anim: "Stella_anim", nameImg: "Stella_name" },
];

export class CharactersScene extends Phaser.Scene {
  private maleIndex = 0;
  private malePreview!: Phaser.GameObjects.Sprite;
  private maleName!: Phaser.GameObjects.Image;
  private femaleIndex = 0;
  private femalePreview!: Phaser.GameObjects.Sprite;
  private femaleName!: Phaser.GameObjects.Image;

  constructor() {
    super({ key: "CharactersScene" });
  }

  preload() {
    
    this.load.image("homeBackground", homeBackground);
    this.load.spritesheet("arrowLeft_idle", arrowLeft, { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("arrowRight_idle", arrowRight, { frameWidth: 32, frameHeight: 32 });

   
    this.load.spritesheet("Greg_idle", gregIdle, { frameWidth: 32, frameHeight: 32 });
    this.load.image("Greg_name", gregName);

    this.load.spritesheet("Damon_idle", damonIdle, { frameWidth: 32, frameHeight: 32 });
    this.load.image("Damon_name", damonName);

    this.load.spritesheet("Tom_idle", tomIdle, { frameWidth: 32, frameHeight: 32 });
    this.load.image("Tom_name", tomName);

    
    this.load.spritesheet("Laura_idle", lauraIdle, { frameWidth: 32, frameHeight: 32 });
    this.load.image("Laura_name", lauraName);

    this.load.spritesheet("Lily_idle", lilyIdle, { frameWidth: 32, frameHeight: 32 });
    this.load.image("Lily_name", lilyName);

    this.load.spritesheet("Stella_idle", stellaIdle, { frameWidth: 32, frameHeight: 32 });
    this.load.image("Stella_name", stellaName);

    this.load.spritesheet("confirm", confirm, {frameWidth:64, frameHeight:32});
  }

  private changeMale(direction: number) {
    this.maleIndex = (this.maleIndex + direction + maleCharacters.length) % maleCharacters.length;
    const currentMale = maleCharacters[this.maleIndex];
    this.malePreview.setTexture(currentMale.texture);
    this.malePreview.play(currentMale.anim);
    this.maleName.setTexture(currentMale.nameImg);
  }

  private changeFemale(direction: number) {
    this.femaleIndex = (this.femaleIndex + direction + femaleCharacters.length) % femaleCharacters.length;
    const currentFemale = femaleCharacters[this.femaleIndex];
    this.femalePreview.setTexture(currentFemale.texture);
    this.femalePreview.play(currentFemale.anim);
    this.femaleName.setTexture(currentFemale.nameImg);
  }

  create() {
    
    this.anims.create({
      key: "arrowLeft_anim",
      frames: this.anims.generateFrameNumbers("arrowLeft_idle", { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1,
    });
    this.anims.create({
      key: "arrowRight_anim",
      frames: this.anims.generateFrameNumbers("arrowRight_idle", { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1,
    });

  
    maleCharacters.forEach((char) => {
      if (!this.anims.exists(char.anim)) {
        this.anims.create({
          key: char.anim,
          frames: this.anims.generateFrameNumbers(char.texture, { start: 0, end: 3 }),
          frameRate: 5,
          repeat: -1,
        });
      }
    });

    femaleCharacters.forEach((char) => {
      if (!this.anims.exists(char.anim)) {
        this.anims.create({
          key: char.anim,
          frames: this.anims.generateFrameNumbers(char.texture, { start: 0, end: 3 }),
          frameRate: 5,
          repeat: -1,
        });
      }
    });

    this.add.image(0, 0, "homeBackground").setOrigin(0, 0).setDisplaySize(innerWidth, innerHeight);

    const centerX = this.scale.width / 2;
    const leftColumnX = centerX * 0.5;
    const rightColumnX = centerX * 1.5;

    const uiY = this.scale.height * 0.45;
    const charY = this.scale.height * 0.75;

    const leftArrowMale = this.add.sprite(leftColumnX - 80, uiY, "arrowLeft_idle").setInteractive().setScale(2).play("arrowLeft_anim");
    const rightArrowMale = this.add.sprite(leftColumnX + 80, uiY, "arrowRight_idle").setInteractive().setScale(2).play("arrowRight_anim");
    const leftArrowFemale = this.add.sprite(rightColumnX - 80, uiY, "arrowLeft_idle").setInteractive().setScale(2).play("arrowLeft_anim");
    const rightArrowFemale = this.add.sprite(rightColumnX + 80, uiY, "arrowRight_idle").setInteractive().setScale(2).play("arrowRight_anim");

    createInteractiveButton(this, centerX * 0.9, this.scale.height * 0.85, "confirm", () => {
      const currentSelectedMale = maleCharacters[this.maleIndex];
      const currentSelectedFemale = femaleCharacters[this.femaleIndex];
      this.game.events.emit("cursor:default");
      this.scene.start("WorldScene", { male: currentSelectedMale, female: currentSelectedFemale });
    });

    const interactiveButtons = [leftArrowFemale, rightArrowFemale, leftArrowMale, rightArrowMale];

    interactiveButtons.forEach((button) => {
      button.on("pointerover", () => this.game.events.emit("cursor:hover"));
      button.on("pointerout", () => this.game.events.emit("cursor:default"));
    });

    leftArrowMale.on("pointerdown", () => {
      this.changeMale(-1);
    });
    rightArrowMale.on("pointerdown", () => {
      this.changeMale(1);
    });

    leftArrowFemale.on("pointerdown", () => {
      this.changeFemale(-1);
    });
    rightArrowFemale.on("pointerdown", () => {
      this.changeFemale(1);
    });

    this.malePreview = this.add.sprite(leftColumnX, charY, maleCharacters[this.maleIndex].texture).play(maleCharacters[this.maleIndex].anim).setScale(15);
    this.maleName = this.add.image(leftColumnX, uiY, maleCharacters[this.maleIndex].nameImg);
    this.femalePreview = this.add.sprite(rightColumnX, charY, femaleCharacters[this.femaleIndex].texture).play(femaleCharacters[this.femaleIndex].anim).setScale(15);
    this.femaleName = this.add.image(rightColumnX, uiY, femaleCharacters[this.femaleIndex].nameImg);
  }
}