import Phaser from "phaser";

interface LocationProps {
    name: string
}

export class LocationScene extends Phaser.Scene {
  constructor() {
    super({ key: "LocationScene" });
  }
  create(data:LocationProps) {
    this.add.text(200, 200, `The minigame about ${data.name} is now.`, {
      color: "#c91d1d",
      fontSize: "32px",
    });
  }
}
