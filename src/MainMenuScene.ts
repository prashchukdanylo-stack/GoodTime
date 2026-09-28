import Phaser from "phaser";

export class MainMenuScene extends Phaser.Scene {
  cursorSprite !: Phaser.GameObjects.Image;
  constructor() {
    super({ key: "MainMenuScene" });
  }
  create() {

    const { width, height } = this.scale;
    this.add.image(0,0,"menuBackground").setOrigin(0,0);

    this.add.sprite(250, 60, "game_title").setOrigin(0,0).setScale(6).play("game_title_anim");

    const startButton = this.add
      .sprite(width/2, height/2, "start", 0).setOrigin(0.5).setScale(2) .setInteractive();

    startButton.on("pointerover", () =>{
      
      startButton.setFrame(1);
      this.game.events.emit("cursor:hover");
    }
    );
    startButton.on("pointerout", () =>{
       startButton.setFrame(0);
    this.game.events.emit("cursor:default")
    }
    );
    startButton.on("pointerdown", () => {
      this.game.events.emit("cursor:default");
      this.scene.start("CharactersScene");
    });
  }
}
