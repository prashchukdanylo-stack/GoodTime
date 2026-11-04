import Phaser from "phaser";

export class MainMenuScene extends Phaser.Scene {
  cursorSprite !: Phaser.GameObjects.Image;
  constructor() {
    super({ key: "MainMenuScene" });
  }
  create() {

    const { width, height } = this.scale;
    const username = localStorage.getItem("playerUsername");

    this.add.image(0,0,"menuBackground").setOrigin(0,0).setDisplaySize(width, height);

    this.add.sprite(width/2 - 240, 60, "game_title").setOrigin(0,0).setScale(8).play("game_title_anim");

    const authButton = this.add.text(100, 300, "Account/Login").setInteractive();
    const statusText = this.add.text(100, 400, "");
    const startButton = this.add
      .sprite(width/2, height/2, "start", 0).setOrigin(0.5).setScale(4) .setInteractive();

      authButton.on("pointerdown", () => {
        this.showAuthModal(statusText);
      })
    startButton.on("pointerover", () =>{
      
      startButton.setFrame(1);
      this.game.events.emit("cursor:hover");
    }
    );
    startButton.on("pointerout", () =>{
       startButton.setFrame(0);
    this.game.events.emit("cursor:default")
    }
    );
    if (username) {
       startButton.on("pointerdown", () => {
      this.game.events.emit("cursor:default");

      this.scene.start("CharactersScene");
    });
    }
   
  }
  private showAuthModal(statusText: Phaser.GameObjects.Text) {
    if (document.getElementById("auth-form-container")) return;

    const backdrop = document.createElement("div");
    backdrop.id = "auth-backdrop";
    backdrop.style.position = "fixed";
    backdrop.style.top = "0";
    backdrop.style.left = "0";
    backdrop.style.width = "100vw";
    backdrop.style.height = "100vh";
    backdrop.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    backdrop.style.zIndex = "999";
    backdrop.style.display = "flex";
    backdrop.style.justifyContent = "center";
    backdrop.style.alignItems = "center";

    const container = document.createElement("div");
    container.id = "auth-form-container";
    container.style.position = "absolute";
    container.style.top = "50%";
    container.style.left = "50%";
    container.style.transform = "translate(-50%, -50%)";
    container.style.background = "rgba(0, 0, 0, 0.9)";
    container.style.padding = "20px";
    container.style.borderRadius = "10px";
    container.style.color = "#fff";
    container.style.fontFamily = "Arial";
    container.style.zIndex = "1000";


    container.innerHTML = `
      <h3>Вхід / Реєстрація</h3>
      <div style="margin-bottom: 10px;">
        <label>Ім'я (тільки для реєстрації):</label><br>
        <input type="text" id="username-input" style="width: 200px; padding: 5px;" />
      </div>
      <div style="margin-bottom: 15px;">
        <label>Email:</label><br>
        <input type="email" id="email-input" style="width: 200px; padding: 5px;" />
      </div>
      <button id="btn-login" style="padding: 5px 10px; cursor: pointer;">Увійти</button>
      <button id="btn-register" style="padding: 5px 10px; cursor: pointer; margin-left: 5px;">Зареєструватись</button>
      <button id="btn-close" style="padding: 5px 10px; cursor: pointer; background: #555; color: #fff; margin-left: 5px;">Закрити</button>
    `;

    backdrop.appendChild(container);
    document.body.appendChild(backdrop);

    document.getElementById("btn-login")?.addEventListener("click", async () => {
      const email = (document.getElementById("email-input") as HTMLInputElement).value;

      try {
        const res = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({email})
        });

        if (!res.ok) throw new Error("player is not found");
        const player = await res.json();

        localStorage.setItem("playerId", player.id);
        localStorage.setItem("playerUsername", player.username);
        statusText.setText(`Welcome back, ${player.username}!`);
        backdrop.remove();
      } catch(e) {
        alert("login error");
      }
    });

    document.getElementById("btn-register")?.addEventListener("click", async () => {
      const username = (document.getElementById("username-input") as HTMLInputElement).value;
      const email = (document.getElementById("email-input") as HTMLInputElement).value;

      try {
        const res = await fetch("http://localhost:3000/api/register", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({username, email})
        });
        if (!res.ok) throw new Error("registration is failed");

        const player = await res.json();

        localStorage.setItem("playerId", player.id);
        localStorage.setItem("playerUsername", player.username);
        statusText.setText(`Welcome to the game, ${player.username}!`);
        backdrop.remove();
      } catch(e) {
        alert("registration error");
      }
    })

    document.getElementById("btn-close")?.addEventListener("click", () => {
      backdrop.remove();
    })
  }
}
