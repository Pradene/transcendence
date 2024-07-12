import {GameSocket} from "./GameSocket";

const CREATEGAMEBUTTON: HTMLButtonElement          = document.querySelector<HTMLButtonElement>("div.game-container button.create-game")!;
const CREATETOURNAMENTBUTTON: HTMLButtonElement    = document.querySelector<HTMLButtonElement>("div.game-container button.create-tournament")!;
const REFRESHBUTTON: HTMLButtonElement             = document.querySelector<HTMLButtonElement>("div.game-container button.refresh-room")!;
const AVAILABLEGAMECONTAINER: HTMLDivElement       = document.querySelector<HTMLDivElement>("div.game-container div.available-game")!;
const AVAILABLETOURNAMENTCONTAINER: HTMLDivElement = document.querySelector<HTMLDivElement>("div.game-container div.available-tournament")!;
const GAMECONTAINER: HTMLDivElement                = document.querySelector<HTMLDivElement>("div.game-container div.game")!;

/**
 * Request a new game to be created //TODO check for race condition
 */
function createGameButtonCallback(): void {
    GameSocket.get().requestNewGame();
}

function refreshButtonCallback(): void {
    GameSocket.get().requestGames();
}

function createTournamentButtonCallback(): void {
    GameSocket.get().requestNewTournament();
}

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
function deactivateButtons(): void {
    CREATEGAMEBUTTON.removeEventListener("click", createGameButtonCallback);
    REFRESHBUTTON.removeEventListener("click", refreshButtonCallback);
    deactivateButton(CREATEGAMEBUTTON);
    deactivateButton(REFRESHBUTTON);
}

export {
    activateButtons,
    deactivateButtons,
    AVAILABLEGAMECONTAINER,
    AVAILABLETOURNAMENTCONTAINER,
    GAMECONTAINER
};