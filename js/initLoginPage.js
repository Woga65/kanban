export function initLoginPage() {
    const parent = document.getElementById("board-container");
    const wsl = document.createElement("ws-login");
    const loginContainer = document.createElement("div");
    loginContainer.classList.add("login-container");
    loginContainer.id = "login-container";
    wsl.classList.add("ws-login");
    wsl.id = "ws-login";
    loginContainer.appendChild(wsl);
    parent.appendChild(loginContainer);
    loginContainer.addEventListener('click', clickedOutside);
}


export function showLoginPage() {
    const login = document.getElementById("login-container");
    login.style.display = "flex";
    setTimeout(() => login.style.opacity = "1");
}


export function hideLoginPage() {
    const login = document.getElementById("login-container");
    login.style.opacity = "0";
    setTimeout(() => login.style.display = "none", 400);
}


/** event listener - clicked on backdrop */
function clickedOutside(e) {
    if (e.target.id && e.target.id == 'login-container' && window.wsLogin.state && window.wsLogin.state.loggedIn) {
        hideLoginPage();
    }
}