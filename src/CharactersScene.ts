import Phaser from "phaser";

const maleCharacters = [
      {name: "Greg", texture: "Greg_idle", anim: "Greg_anim"},
      {name: "Damon", texture: "Damon_idle", anim: "Damon_anim"},
      { name: "Tom", texture: "Tom_idle", anim: "Tom_anim" },
    ];
    const femaleCharacters = [
        {name: "Laura", texture: "Laura_idle", anim: "Laura_anim"},
        {name: "Lily", texture: "Lily_idle", anim: "Lily_anim"},
        {name: "Stella", texture: "Stella_idle", anim: "Stella_anim"},
    ]


export class CharactersScene extends Phaser.Scene {
  private maleIndex = 0;
  private malePreview!: Phaser.GameObjects.Sprite;
  private maleText!: Phaser.GameObjects.Text;
  private femaleIndex = 0;
  private femalePreview!: Phaser.GameObjects.Sprite;
  private femaleText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "CharactersScene" });
  }

  private changeMale(direction:number) {
    this.maleIndex = (this.maleIndex + direction + maleCharacters.length)%maleCharacters.length;
    const currentMale = maleCharacters[this.maleIndex];
    this.malePreview.setTexture(currentMale.texture);
    this.malePreview.play(currentMale.anim);
    this.maleText.setText(currentMale.name);
  }
  private changeFemale(direction:number) {
    this.femaleIndex = (this.femaleIndex + direction + femaleCharacters.length)%femaleCharacters.length;
    const currentFemale = femaleCharacters[this.femaleIndex];
    this.femalePreview.setTexture(currentFemale.texture);
    this.femalePreview.play(currentFemale.anim);
    this.femaleText.setText(currentFemale.name);
  }

  create() {
    this.add.text(200, 200, "Choose your characters!!!", { fontSize: "32px" });
    const leftArrowMale = this.add.text(170, 520, "<").setInteractive({useHandCursor: true});
    const rightArrowMale = this.add.text(200, 520, ">").setInteractive({useHandCursor: true});
    const leftArrowFemale = this.add.text(670, 520, "<").setInteractive({useHandCursor: true});
    const rightArrowFemale = this.add.text(700, 520, ">").setInteractive({useHandCursor: true});

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

    this.malePreview = this.add.sprite(200, 400, maleCharacters[0].texture).play(maleCharacters[0].anim).setScale(6);
    this.maleText = this.add.text(200, 500, "Greg");
    this.femalePreview = this.add.sprite(700, 400, femaleCharacters[0].texture).play(femaleCharacters[0].anim).setScale(6);
    this.femaleText = this.add.text(700, 500, "Laura");

    const confirm = this.add.text(400, 500, "Confirm").setInteractive({useHandCursor: true});
    confirm.on("pointerdown", () => {
        const currentSelectedMale = maleCharacters[this.maleIndex];
        const currentSelectedFemale = femaleCharacters[this.femaleIndex];
        this.scene.start("WorldScene", {male: currentSelectedMale, female: currentSelectedFemale }); 
    })
  }
}
