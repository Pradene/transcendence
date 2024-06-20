import { GameSocket } from "./GameSocket";
const STARTBUTTON = document.querySelector("div.game-container button.create-game");
const REFRESHBUTTON = document.querySelector("div.game-container button.refresh-room");
const USERNAMEINPUT = document.querySelector("div.game-container #username");
function startButtonCallback() {
    GameSocket.get().requestNewGame();
}
function refreshButtonCallback() { }
function joinButtonCallback() { }
function activateButton(button) {
    button.classList.add("active");
}
function deactivateButton(button) {
    button.classList.remove("active");
}
function activateButtons() {
    STARTBUTTON.addEventListener("click", startButtonCallback);
    REFRESHBUTTON.addEventListener("click", refreshButtonCallback);
    activateButton(STARTBUTTON);
    activateButton(REFRESHBUTTON);
}
function deactivateButtons() {
    STARTBUTTON.removeEventListener("click", startButtonCallback);
    REFRESHBUTTON.removeEventListener("click", refreshButtonCallback);
    deactivateButton(STARTBUTTON);
    deactivateButton(REFRESHBUTTON);
}
export { activateButtons, deactivateButtons };
