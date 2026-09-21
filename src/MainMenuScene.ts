import Phaser from "phaser";

export class MainMenuScene extends Phaser.Scene {
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
      .setInteractive({ useHandCursor: true });

    startButton.on("pointerover", () =>
      startButton.setStyle({ color: "#692323" }),
    );
    startButton.on("pointerout", () =>
      startButton.setStyle({ color: "#c91d1d" }),
    );
    startButton.on("pointerdown", () => {
      this.scene.start("CharactersScene");
    });
  }
}
