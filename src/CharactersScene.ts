import Phaser from "phaser";

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
    this.add.image(0,0,"homeBackground").setOrigin(0,0);
    const leftArrowMale = this.add.sprite(140, 440, "arrowLeft_idle").setInteractive().setScale(2).play("arrowLeft_anim");
    const rightArrowMale = this.add.sprite(250, 440, "arrowRight_idle").setInteractive().setScale(2).play("arrowRight_anim");
    const leftArrowFemale = this.add.sprite(640, 440, "arrowLeft_idle").setInteractive().setScale(2).play("arrowLeft_anim");
    const rightArrowFemale = this.add.sprite(760, 440, "arrowRight_idle").setInteractive().setScale(2).play("arrowRight_anim");
    const confirm = this.add.sprite(440, 270, "confirm").setInteractive().setScale(2);

    const interactiveButtons = [leftArrowFemale, rightArrowFemale, leftArrowMale, rightArrowMale, confirm];

    interactiveButtons.forEach((element) => {
      element.on("pointerover", () => this.game.events.emit("cursor:hover"));
      element.on("pointerout", () => this.game.events.emit("cursor:default"));
    })
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

    this.malePreview = this.add.sprite(200, 300, maleCharacters[0].texture).play(maleCharacters[0].anim).setScale(8);
    this.maleName = this.add.image(200, 430, "Greg_name");
    this.femalePreview = this.add.sprite(700, 300, femaleCharacters[0].texture).play(femaleCharacters[0].anim).setScale(8);
    this.femaleName = this.add.image(700, 430, "Laura_name");

    confirm.on("pointerdown", () => {
        const currentSelectedMale = maleCharacters[this.maleIndex];
        const currentSelectedFemale = femaleCharacters[this.femaleIndex];
        this.game.events.emit("cursor:default");
        this.scene.start("WorldScene", {male: currentSelectedMale, female: currentSelectedFemale }); 
    })
    confirm.on("pointerover", () => confirm.setFrame(1));
    confirm.on("pointerout", ()=> confirm.setFrame(0));
  }
}
