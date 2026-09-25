import Phaser from "phaser";

export class MainMenuScene extends Phaser.Scene {
  cursorSprite !: Phaser.GameObjects.Image;
  constructor() {
    super({ key: "MainMenuScene" });
  }
  create() {

    const { width, height } = this.scale;

    this.add
      .text(width / 2,height / 3, "Good Times", {
        fontSize: "64px",
        color: "#0a5448",
      })
      .setOrigin(0.5);

    const startButton = this.add
      .text(width / 2, height / 2, "Start", {
        fontSize: "32px",
        color: "#c91d1d",
      })
      .setOrigin(0.5)
      .setInteractive();

    startButton.on("pointerover", () =>{
      startButton.setStyle({ color: "#692323" })
      this.game.events.emit("cursor:hover");
    }
    );
    startButton.on("pointerout", () =>{
      startButton.setStyle({ color: "#c91d1d" })
    this.game.events.emit("cursor:default")
    }
    );
    startButton.on("pointerdown", () => {
      this.game.events.emit("cursor:default");
      this.scene.start("CharactersScene");
    });
  }
}
