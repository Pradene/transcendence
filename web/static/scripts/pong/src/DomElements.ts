import {GameSocket} from "./GameSocket";
import {GAME_MODE}  from "./Defines";

let CREATEGAMEBUTTON: HTMLButtonElement          = document.querySelector<HTMLButtonElement>("div.game-container button.create-game")!;
let CREATETOURNAMENTBUTTON: HTMLButtonElement    = document.querySelector<HTMLButtonElement>("div.game-container button.create-tournament")!;
let REFRESHBUTTON: HTMLButtonElement             = document.querySelector<HTMLButtonElement>("div.game-container button.refresh-room")!;
let AVAILABLEGAMECONTAINER: HTMLDivElement       = document.querySelector<HTMLDivElement>("div.game-container div.available-game")!;
let AVAILABLETOURNAMENTCONTAINER: HTMLDivElement = document.querySelector<HTMLDivElement>("div.game-container div.available-tournament")!;
let GAMECONTAINER: HTMLDivElement                = document.querySelector<HTMLDivElement>("div.game-container div.game")!;
let USERSCONTAINER: HTMLDivElement               = document.querySelector<HTMLDivElement>("div.game-container div.user-list")!;

const FIRST_LINK: NodeListOf<HTMLAnchorElement> = document.querySelectorAll<HTMLAnchorElement>("nav div a[data-link]")!;
const HOME_LINK: HTMLAnchorElement              = document.querySelector<HTMLAnchorElement>("nav > a")!;

function regenerateButtons(): void {
    CREATEGAMEBUTTON             = document.querySelector<HTMLButtonElement>("div.game-container button.create-game")!;
    CREATETOURNAMENTBUTTON       = document.querySelector<HTMLButtonElement>("div.game-container button.create-tournament")!;
    REFRESHBUTTON                = document.querySelector<HTMLButtonElement>("div.game-container button.refresh-room")!;
    AVAILABLEGAMECONTAINER       = document.querySelector<HTMLDivElement>("div.game-container div.available-game")!;
    AVAILABLETOURNAMENTCONTAINER = document.querySelector<HTMLDivElement>("div.game-container div.available-tournament")!;
    GAMECONTAINER                = document.querySelector<HTMLDivElement>("div.game-container div.game")!;
    USERSCONTAINER               = document.querySelector<HTMLDivElement>("div.game-container div.user-list")!;
}

/**
 * Request a new game to be created //TODO check for race condition
 */
async function createGameButtonCallback(): Promise<void> {
    let gs: GameSocket = await GameSocket.get();
    gs.requestNewGame();
}

async function refreshButtonCallback(): Promise<void> {
    let gs: GameSocket = await GameSocket.get();
    gs.requestGames();
}

async function createTournamentButtonCallback(): Promise<void> {
    let gs: GameSocket = await GameSocket.get();
    gs.requestNewTournament();
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
function deactivateButtons(): void {
    CREATEGAMEBUTTON.removeEventListener("click", createGameButtonCallback);
    REFRESHBUTTON.removeEventListener("click", refreshButtonCallback);
    deactivateButton(CREATEGAMEBUTTON);
    deactivateButton(REFRESHBUTTON);
}

export function getModifiersFromSettings(): string[] {
    let wind: HTMLInputElement       = document.querySelector<HTMLInputElement>("#wind")!;
    let rain: HTMLInputElement       = document.querySelector<HTMLInputElement>("#rain")!;
    let lightnight: HTMLInputElement = document.querySelector<HTMLInputElement>("#lightnight")!;

    let modifiers: string[] = [];

    if (wind.checked)
        modifiers.push(GAME_MODE.WIND);
    if (rain.checked)
        modifiers.push(GAME_MODE.RAIN);
    if (lightnight.checked)
        modifiers.push(GAME_MODE.LIGHTNIGHT);

    return modifiers;
}

export {
    activateButtons,
    deactivateButtons,
    AVAILABLEGAMECONTAINER,
    AVAILABLETOURNAMENTCONTAINER,
    GAMECONTAINER,
    USERSCONTAINER
};