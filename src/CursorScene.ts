import Phaser from "phaser";

export class CursorScene extends Phaser.Scene {
    private cursorSprite!: Phaser.GameObjects.Sprite;
    constructor() {
        super({key: "CursorScene"})
    }
    create() {


        this.input.setDefaultCursor("none");

    const initialX = this.input.activePointer.x || 0;
    const initialY = this.input.activePointer.y || 0;

    this.cursorSprite = this.add.sprite(initialX, initialY, "cursor")
    this.cursorSprite.setScale(1.5);
    this.cursorSprite.setOrigin(0, 0);
    this.cursorSprite.setDepth(99999);

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      this.cursorSprite.setPosition(pointer.x, pointer.y);
    });

    this.input.on("gameout", () => {
      this.cursorSprite.setVisible(false);
    });
    this.input.on("gameover", () => {
      this.cursorSprite.setVisible(true);
    });

    this.game.events.off("cursor:hover");
    this.game.events.off("cursor:default");

   this.game.events.on("cursor:hover", () => {
    this.cursorSprite.setTexture("cursor_pointer_idle").play("cursor_pointer_anim");

   })
   this.game.events.on("cursor:default", () => {
      this.cursorSprite.setTexture("cursor").stop();
    });
    this.scene.bringToTop();
    }

}