import { GameSocket } from "./GameSocket";
const STARTBUTTON = document.querySelector("div.game-container button.create-game");
const REFRESHBUTTON = document.querySelector("div.game-container button.refresh-room");
const USERNAMEINPUT = document.querySelector("div.game-container #username");
const ROOMCONTAINER = document.querySelector("div.game-container div.rooms");
const GAMECONTAINER = document.querySelector("div.game-container div.game");
/**
 * Request a new game to be created //TODO check for race condition
 */
function startButtonCallback() {
    GameSocket.get().requestNewGame();
}
function refreshButtonCallback() {
    GameSocket.get().requestGames();
}
function joinButtonCallback() { }
/**
 * Activate a button
 * @param button
 */
function activateButton(button) {
    button.classList.add("active");
}
/**
 * Deactivate a button
 * @param button
 */
function deactivateButton(button) {
    button.classList.remove("active");
}
/**
 * Activate the buttons, is called when the websocket finished connecting
 */
function activateButtons() {
    STARTBUTTON.addEventListener("click", startButtonCallback);
    REFRESHBUTTON.addEventListener("click", refreshButtonCallback);
    activateButton(STARTBUTTON);
    activateButton(REFRESHBUTTON);
}
/**
 * Disable buttons, should be called on lost connection //TODO call it
 */
function deactivateButtons() {
    STARTBUTTON.removeEventListener("click", startButtonCallback);
    REFRESHBUTTON.removeEventListener("click", refreshButtonCallback);
    deactivateButton(STARTBUTTON);
    deactivateButton(REFRESHBUTTON);
}
export { activateButtons, deactivateButtons, USERNAMEINPUT, ROOMCONTAINER, GAMECONTAINER };
