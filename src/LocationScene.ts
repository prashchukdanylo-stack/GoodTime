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
    this.cameras.main.fadeOut(300, 0, 0, 0);

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(info.key, info.data);
    });
  }
}
