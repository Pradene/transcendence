import { GameSocket } from "./GameSocket";
let JOINGAMEQUEUEBUTTON = document.querySelector("div.game-container button.create-game");
let JOINTOURNAMENTQUEUEBUTTON = document.querySelector("div.game-container button.create-tournament");
let AVAILABLEGAMECONTAINER = document.querySelector("div.game-container div.available-game");
let AVAILABLETOURNAMENTCONTAINER = document.querySelector("div.game-container div.available-tournament");
let GAMECONTAINER = document.querySelector("div.game-container div.game");
let USERSCONTAINER = document.querySelector("div.game-container div.user-list");
const FIRST_LINK = document.querySelectorAll("nav div a[data-link]");
const HOME_LINK = document.querySelector("nav > a");
function regenerateButtons() {
    JOINGAMEQUEUEBUTTON = document.querySelector("div.game-container button.create-game");
    JOINTOURNAMENTQUEUEBUTTON = document.querySelector("div.game-container button.create-tournament");
    AVAILABLEGAMECONTAINER = document.querySelector("div.game-container div.available-game");
    AVAILABLETOURNAMENTCONTAINER = document.querySelector("div.game-container div.available-tournament");
    GAMECONTAINER = document.querySelector("div.game-container div.game");
    USERSCONTAINER = document.querySelector("div.game-container div.user-list");
}
/**
 * Request a new game to be created //TODO check for race condition
 */
async function createGameButtonCallback() {
    let gs = await GameSocket.get();
    gs.requestJoinGameQueue();
}
async function createTournamentButtonCallback() {
    let gs = await GameSocket.get();
    gs.requestJoinTournamentQueue();
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
    regenerateButtons();
    JOINGAMEQUEUEBUTTON.addEventListener("click", createGameButtonCallback);
    JOINTOURNAMENTQUEUEBUTTON.addEventListener("click", createTournamentButtonCallback);
    activateButton(JOINGAMEQUEUEBUTTON);
    activateButton(JOINTOURNAMENTQUEUEBUTTON);
    // Close the socket when the user navigates away
    FIRST_LINK.forEach((link) => {
        link.addEventListener("click", async (event) => {
            let gs = await GameSocket.get();
            gs.close();
        });
    });
    // Reopen the socket when the user navigates back
    HOME_LINK.addEventListener("click", async (event) => {
        let gs = await GameSocket.get();
    });
}
/**
 * Disable buttons, should be called on lost connection //TODO call it
 */
function deactivateButtons() {
    JOINGAMEQUEUEBUTTON.removeEventListener("click", createGameButtonCallback);
    deactivateButton(JOINGAMEQUEUEBUTTON);
}
export { activateButtons, deactivateButtons, AVAILABLEGAMECONTAINER, AVAILABLETOURNAMENTCONTAINER, GAMECONTAINER, USERSCONTAINER };
