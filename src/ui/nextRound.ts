import Phaser from "phaser";

interface NextRoundOptions {
  scene: Phaser.Scene;
  nextIndex: number;
  totalRounds?: number;
  delay?: number;
  onStart: (nextIndex: number) => void;
}

export function showNextRoundBanner({
  scene,
  nextIndex,
  delay = 1500,
  onStart,
}: NextRoundOptions) {
  const roundBanner = scene.add
    .text(
      scene.scale.width / 2,
      scene.scale.height / 2,
      `Round ${nextIndex + 1}!`,
      {
        fontSize: "32px",
        color: "#ffff00",
        stroke: "#000000",
        strokeThickness: 4,
      },
    )
    .setOrigin(0.5);

  scene.time.delayedCall(delay, () => {
    roundBanner.destroy();
    onStart(nextIndex);
  });
}
