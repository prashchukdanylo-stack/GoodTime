import Phaser from "phaser";
import { createInteractiveButton } from "./ui/createInteractiveButton";
const maleCharacters = [
      {name: "Greg", texture: "Greg_idle", anim: "Greg_anim", nameImg: "Greg_name"},
      {name: "Damon", texture: "Damon_idle", anim: "Damon_anim", nameImg: "Damon_name"},
      { name: "Tom", texture: "Tom_idle", anim: "Tom_anim", nameImg: "Tom_name" },
    ];
    const femaleCharacters = [
        {name: "Laura", texture: "Laura_idle", anim: "Laura_anim", nameImg: "Laura_name"},
        {name: "Lily", texture: "Lily_idle", anim: "Lily_anim", nameImg: "Lily_name"},
        {name: "Stella", texture: "Stella_idle", anim: "Stella_anim", nameImg: "Stella_name"},
    ]


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

  private changeMale(direction:number) {
    this.maleIndex = (this.maleIndex + direction + maleCharacters.length)%maleCharacters.length;
    const currentMale = maleCharacters[this.maleIndex];
    this.malePreview.setTexture(currentMale.texture);
    this.malePreview.play(currentMale.anim);
    this.maleName.setTexture(currentMale.nameImg);
  }
  private changeFemale(direction:number) {
    this.femaleIndex = (this.femaleIndex + direction + femaleCharacters.length)%femaleCharacters.length;
    const currentFemale = femaleCharacters[this.femaleIndex];
    this.femalePreview.setTexture(currentFemale.texture);
    this.femalePreview.play(currentFemale.anim);
    this.femaleName.setTexture(currentFemale.nameImg);
  }

  create() {
    this.add.image(0,0,"homeBackground").setOrigin(0,0).setDisplaySize(innerWidth, innerHeight);

    const centerX = this.scale.width / 2;
    const leftColumnX = centerX *0.5;  
    const rightColumnX = centerX *1.5;

    const uiY = this.scale.height * 0.45; // Позиція по вертикалі для імен та стрілок
    const charY = this.scale.height * 0.75; // Позиція по вертикалі для персонажів

    const leftArrowMale = this.add.sprite(leftColumnX - 80, uiY, "arrowLeft_idle").setInteractive().setScale(2).play("arrowLeft_anim");
    const rightArrowMale = this.add.sprite(leftColumnX + 80, uiY, "arrowRight_idle").setInteractive().setScale(2).play("arrowRight_anim");
    const leftArrowFemale = this.add.sprite(rightColumnX - 80, uiY, "arrowLeft_idle").setInteractive().setScale(2).play("arrowLeft_anim");
    const rightArrowFemale = this.add.sprite(rightColumnX + 80, uiY, "arrowRight_idle").setInteractive().setScale(2).play("arrowRight_anim");
    
    createInteractiveButton(this,centerX * 0.9, this.scale.height * 0.85, "confirm", () => {
          const currentSelectedMale = maleCharacters[this.maleIndex];
        const currentSelectedFemale = femaleCharacters[this.femaleIndex];
        this.game.events.emit("cursor:default");
        this.scene.start("WorldScene", {male: currentSelectedMale, female: currentSelectedFemale }); 
       });
    const interactiveButtons = [leftArrowFemale, rightArrowFemale, leftArrowMale, rightArrowMale];

       interactiveButtons.forEach(((button) => {
        button.on("pointerover", () => this.game.events.emit("cursor:hover"));
        button.on("pointerout", () => this.game.events.emit("cursor:default"));
       }))
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
    })

    this.malePreview = this.add.sprite(leftColumnX, charY, maleCharacters[this.maleIndex].texture).play(maleCharacters[this.maleIndex].anim).setScale(15);
    this.maleName = this.add.image(leftColumnX, uiY, maleCharacters[this.maleIndex].nameImg);
    this.femalePreview = this.add.sprite(rightColumnX, charY, femaleCharacters[this.femaleIndex].texture).play(femaleCharacters[this.femaleIndex].anim).setScale(15);
    this.femaleName = this.add.image(rightColumnX, uiY, femaleCharacters[this.femaleIndex].nameImg);
  }
}
