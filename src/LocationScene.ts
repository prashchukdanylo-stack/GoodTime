import Phaser from "phaser";

interface LocationProps {
    key: string
}

export class LocationScene extends Phaser.Scene {
  constructor() {
    super({ key: "LocationScene" });
  }
  create(data:LocationProps) {
    this.scene.start(data.key);
  }
}
