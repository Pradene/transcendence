import { GameSocket } from "./GameSocket.js";

let CREATEGAMEBUTTON = document.querySelector("div.game-container button.create-game");
let CREATETOURNAMENTBUTTON = document.querySelector("div.game-container button.create-tournament");
let REFRESHBUTTON = document.querySelector("div.game-container button.refresh-room");
let AVAILABLEGAMECONTAINER = document.querySelector("div.game-container div.available-game");
let AVAILABLETOURNAMENTCONTAINER = document.querySelector("div.game-container div.available-tournament");
let GAMECONTAINER = document.querySelector("div.game-container div.game");
let USERSCONTAINER = document.querySelector("div.game-container div.user-list");
const FIRST_LINK = document.querySelectorAll("nav div a[data-link]");
const HOME_LINK = document.querySelector("nav > a");
function regenerateButtons() {
    CREATEGAMEBUTTON = document.querySelector("div.game-container button.create-game");
    CREATETOURNAMENTBUTTON = document.querySelector("div.game-container button.create-tournament");
    REFRESHBUTTON = document.querySelector("div.game-container button.refresh-room");
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
    regenerateButtons();
    CREATEGAMEBUTTON.addEventListener("click", createGameButtonCallback);
    CREATETOURNAMENTBUTTON.addEventListener("click", createTournamentButtonCallback);
    REFRESHBUTTON.addEventListener("click", refreshButtonCallback);
    activateButton(CREATEGAMEBUTTON);
    activateButton(CREATETOURNAMENTBUTTON);
    activateButton(REFRESHBUTTON);
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
    CREATEGAMEBUTTON.removeEventListener("click", createGameButtonCallback);
    REFRESHBUTTON.removeEventListener("click", refreshButtonCallback);
    deactivateButton(CREATEGAMEBUTTON);
    deactivateButton(REFRESHBUTTON);
}

export { activateButtons, deactivateButtons, AVAILABLEGAMECONTAINER, AVAILABLETOURNAMENTCONTAINER, GAMECONTAINER, USERSCONTAINER };
