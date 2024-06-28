import { GameSocket } from "./GameSocket";
const CREATEGAMEBUTTON = document.querySelector("div.game-container button.create-game");
const CREATETOURNAMENTBUTTON = document.querySelector("div.game-container button.create-tournament");
const REFRESHBUTTON = document.querySelector("div.game-container button.refresh-room");
const USERNAMEINPUT = document.querySelector("div.game-container #username");
const AVAILABLEGAMECONTAINER = document.querySelector("div.game-container div.available-games");
const AVAILABLETOURNAMENTCONTAINER = document.querySelector("div.game-container div.available-tournaments");
const GAMECONTAINER = document.querySelector("div.game-container div.game");
/**
 * Request a new game to be created //TODO check for race condition
 */
function createGameButtonCallback() {
    GameSocket.get().requestNewGame();
}
function refreshButtonCallback() {
    GameSocket.get().requestGames();
}
function createTournamentButtonCallback() {
    GameSocket.get().requestNewTournament();
}
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
    CREATEGAMEBUTTON.addEventListener("click", createGameButtonCallback);
    CREATETOURNAMENTBUTTON.addEventListener("click", createTournamentButtonCallback);
    REFRESHBUTTON.addEventListener("click", refreshButtonCallback);
    activateButton(CREATEGAMEBUTTON);
    activateButton(CREATETOURNAMENTBUTTON);
    activateButton(REFRESHBUTTON);
}
/**
 * Disable buttons, should be called on lost connection //TODO call it
 */
function deactivateButtons() {
    CREATEGAMEBUTTON.removeEventListener("click", createGameButtonCallback);
    REFRESHBUTTON.removeEventListener("click", refreshButtonCallback);
    deactivateButton(CREATEGAMEBUTTON);
    deactivateButton(REFRESHBUTTON);
}
export { activateButtons, deactivateButtons, USERNAMEINPUT, AVAILABLEGAMECONTAINER, AVAILABLETOURNAMENTCONTAINER, GAMECONTAINER };
