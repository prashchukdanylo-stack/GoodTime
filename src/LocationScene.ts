import Phaser from "phaser";

interface LocationProps {
    key: string,
    data: object
}

export class LocationScene extends Phaser.Scene {
  constructor() {
    super({ key: "LocationScene" });
  }
  create(info:LocationProps) {
    this.scene.start(info.key, info.data);
  }
}
