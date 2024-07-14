import { GameSocket } from "./GameSocket";
const CREATEGAMEBUTTON = document.querySelector("div.game-container button.create-game");
const CREATETOURNAMENTBUTTON = document.querySelector("div.game-container button.create-tournament");
const REFRESHBUTTON = document.querySelector("div.game-container button.refresh-room");
const AVAILABLEGAMECONTAINER = document.querySelector("div.game-container div.available-game");
const AVAILABLETOURNAMENTCONTAINER = document.querySelector("div.game-container div.available-tournament");
const GAMECONTAINER = document.querySelector("div.game-container div.game");
const FIRST_LINK = document.querySelectorAll("nav div a[data-link]");
/**
 * Request a new game to be created //TODO check for race condition
 */
async function createGameButtonCallback() {
    let gs = await GameSocket.get();
    gs.requestNewGame();
}
async function refreshButtonCallback() {
    let gs = await GameSocket.get();
    gs.requestGames();
}
async function createTournamentButtonCallback() {
    let gs = await GameSocket.get();
    gs.requestNewTournament();
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
    FIRST_LINK.forEach((link) => {
        link.addEventListener("click", async (event) => {
            let gs = await GameSocket.get();
            gs.close();
        });
    });
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
export { activateButtons, deactivateButtons, AVAILABLEGAMECONTAINER, AVAILABLETOURNAMENTCONTAINER, GAMECONTAINER };
