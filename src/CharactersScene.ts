import Phaser from "phaser";

export class CharactersScene extends Phaser.Scene {
  constructor() {
    super({ key: "CharactersScene" });
  }

  create() {
    this.add.text(200, 200, "Choose your characters!!!", { fontSize: "32px" });

    const maleCharacters = [
      { name: "Danya", texture: "male1_idle", anim: "idle1" }
    ];
    const femaleCharacters = [
        {name: "Nastya", texture: "player2_idle", anim: "idle2"}
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
