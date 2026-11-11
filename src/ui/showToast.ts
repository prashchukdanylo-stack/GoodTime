export function showToast(message: string, type: "success" | "error" = "success") {
    let container = document.getElementById("toast-container");

    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `game-toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
        if (container && container.children.length === 0) {
            container.remove();
        }
    }, 3000);
}