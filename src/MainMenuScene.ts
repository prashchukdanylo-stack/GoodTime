import Phaser from "phaser";
import "./css/authModal.css";
import "./css/toasts.css";
import { showToast } from "./ui/showToast";
import { storeSelectedCharacters } from "./characters";

export class MainMenuScene extends Phaser.Scene {
  cursorSprite!: Phaser.GameObjects.Image;
  usernameText!: Phaser.GameObjects.Text;
  constructor() {
    super({ key: "MainMenuScene" });
  }
  create() {
    
    const { width, height } = this.scale;
    const username = localStorage.getItem("playerUsername");

    this.add
      .image(0, 0, "menuBackground")
      .setOrigin(0, 0)
      .setDisplaySize(width, height);

    this.usernameText = this.add.text(
      100,
      100,
      username
        ? `Welcome, ${username}!`
        : "",
      {
        fontSize: "20px",
        color: "#000000",
        fontFamily: '"Press Start 2P"'
      },
    );

    this.add
      .sprite(width / 2 - 240, 60, "game_title")
      .setOrigin(0, 0)
      .setScale(8)
      .play("game_title_anim");

    const authButton = this.add
      .sprite(100, 200, "account_btn")
      .setOrigin(0.0)
      .setScale(4)
      .setInteractive();
    const startButton = this.add
      .sprite(width / 2, height / 2, "start", 0)
      .setOrigin(0.5)
      .setScale(4)
      .setInteractive();

    authButton.on("pointerdown", () => {
      authButton.setFrame(0);
      this.showAuthModal();
    });
    authButton.on("pointerover", () => {
      authButton.setFrame(1);
      this.game.events.emit("cursor:hover");
    });
    authButton.on("pointerout", () => {
      authButton.setFrame(0);
      this.game.events.emit("cursor:default");
    });

    startButton.on("pointerover", () => {
      startButton.setFrame(1);
      this.game.events.emit("cursor:hover");
    });
    startButton.on("pointerout", () => {
      startButton.setFrame(0);
      this.game.events.emit("cursor:default");
    });
    startButton.on("pointerdown", () => {
  if (!localStorage.getItem("playerUsername")) {
    showToast("Please, log in or register first", "error");
    return;
  }
  this.game.events.emit("cursor:default");

  localStorage.setItem("lastScene", "CharactersScene");
  this.scene.start("CharactersScene");
});
  }
  private showAuthModal() {
    if (document.getElementById("auth-backdrop")) return;

    this.input.enabled = false;

    const backdrop = document.createElement("div");
    backdrop.id = "auth-backdrop";

    const container = document.createElement("div");
    container.id = "auth-form-container";

    container.innerHTML = `
      <h3>Login / Registration</h3>
      <div class="auth-field">
        <label>Username:</label>
        <input type="text" id="username-input" placeholder="only for registration" />
      </div>
      <div class="auth-field">
        <label>Email:</label>
        <input type="email" id="email-input" />
      </div>
      <div class="auth-field">
        <label>Password:</label>
        <input type="password" id="password_input" />
      </div>
      <div class="auth-actions">
        <button id="btn-login">Login</button>
        <button id="btn-register">Register</button>
        <button id="btn-close">Close</button>
      </div>
    `;

    backdrop.appendChild(container);
    document.body.appendChild(backdrop);

    const closeModal = () => {
      backdrop.remove();
      this.input.enabled = true;
    };

    
    document.getElementById("btn-login")?.addEventListener("click", async () => {
      const email = (document.getElementById("email-input") as HTMLInputElement).value;
      const password = (document.getElementById("password_input") as HTMLInputElement).value;

      try {
        const res = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password}),
        });

        if (!res.ok) throw new Error("Email or password is not valid");
        const player = await res.json();

        localStorage.setItem("playerId", player.id);
        localStorage.setItem("playerUsername", player.username);
        storeSelectedCharacters(player.selectedCharacters);

        showToast(`Welcome back, ${player.username}!`);
        closeModal();
      } catch (e) {
        showToast("Error: check email and password for validity", "error");
        console.error(e);
      }
    });

    document.getElementById("btn-register")?.addEventListener("click", async () => {
      const username = (document.getElementById("username-input") as HTMLInputElement).value;
      const email = (document.getElementById("email-input") as HTMLInputElement).value;
      const password = (document.getElementById("password_input") as HTMLInputElement).value;

      try {
        const res = await fetch("http://localhost:3000/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, username }),
        });
        if (!res.ok) throw new Error("Registration error");

        const player = await res.json();

        localStorage.setItem("playerId", player.id);
        localStorage.setItem("playerUsername", player.username);
        showToast(`Welcome, ${player.username}!`);
        closeModal();
      } catch (e) {
        showToast("Registration error", "error");
        console.error(e);
      }
    });

    document.getElementById("btn-close")?.addEventListener("click", closeModal);
  }
}
