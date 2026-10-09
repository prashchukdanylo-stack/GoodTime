import Phaser from "phaser";

export function createInteractiveButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  image: string,
  onClick: () => void,
) {
  const button = scene.add
    .sprite(x, y, image)
    .setInteractive().setScale(3).setOrigin(0,0);

  button.on("pointerdown", onClick);
  button.on("pointerover", () =>{scene.game.events.emit("cursor:hover");
    button.setFrame(1);
  });
  button.on("pointerout", () => {scene.game.events.emit("cursor:default");
    button.setFrame(0);
  });

  return button;
}
