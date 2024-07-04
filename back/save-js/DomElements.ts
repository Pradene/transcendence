import {GameSocket} from "./GameSocket";

const STARTBUTTON: HTMLButtonElement   = document.querySelector("div.game-container button.create-game")!;
const REFRESHBUTTON: HTMLButtonElement = document.querySelector("div.game-container button.refresh-room")!;
const USERNAMEINPUT: HTMLInputElement   = document.querySelector("div.game-container #username")!;
const ROOMCONTAINER: HTMLDivElement     = document.querySelector("div.game-container div.rooms")!;
const GAMECONTAINER: HTMLDivElement     = document.querySelector("div.game-container div.game")!;

/**
 * Request a new game to be created //TODO check for race condition
 */
function startButtonCallback(): void {
    GameSocket.get().requestNewGame();
}

function refreshButtonCallback(): void {
    GameSocket.get().requestGames();
}

function joinButtonCallback(): void {}

/**
 * Activate a button
 * @param button 
 */
function activateButton(button: HTMLButtonElement): void {
    button.classList.add("active");
}

/**
 * Deactivate a button
 * @param button 
 */
function deactivateButton(button: HTMLButtonElement): void {
    button.classList.remove("active");
}

/**
 * Activate the buttons, is called when the websocket finished connecting
 */
function activateButtons(): void {
    STARTBUTTON.addEventListener("click", startButtonCallback);
    REFRESHBUTTON.addEventListener("click", refreshButtonCallback);
    activateButton(STARTBUTTON);
    activateButton(REFRESHBUTTON);
}

/**
 * Disable buttons, should be called on lost connection //TODO call it
 */
function deactivateButtons(): void {
    STARTBUTTON.removeEventListener("click", startButtonCallback);
    REFRESHBUTTON.removeEventListener("click", refreshButtonCallback);
    deactivateButton(STARTBUTTON);
    deactivateButton(REFRESHBUTTON);
}

export {activateButtons, deactivateButtons, USERNAMEINPUT, ROOMCONTAINER, GAMECONTAINER};