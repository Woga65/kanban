export function initLoginPage() {
    const parent = document.getElementById("board-container");
    const wsl = document.createElement("ws-login");
    const loginContainer = document.createElement("div");
    loginContainer.classList.add("login-container");
    loginContainer.id = "login-container";
    loginContainer.style = "display: none; opacity: 0;";
    wsl.classList.add("ws-login");
    wsl.id = "ws-login";
    loginContainer.appendChild(wsl);
    parent.appendChild(loginContainer);
}