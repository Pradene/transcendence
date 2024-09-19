import {GameSocket} from "./GameSocket";

let JOINGAMEQUEUEBUTTON: HTMLButtonElement          = document.querySelector<HTMLButtonElement>("div.game-container button.create-game")!;
let JOINTOURNAMENTQUEUEBUTTON: HTMLButtonElement    = document.querySelector<HTMLButtonElement>("div.game-container button.create-tournament")!;
let AVAILABLEGAMECONTAINER: HTMLDivElement       = document.querySelector<HTMLDivElement>("div.game-container div.available-game")!;
let AVAILABLETOURNAMENTCONTAINER: HTMLDivElement = document.querySelector<HTMLDivElement>("div.game-container div.available-tournament")!;
let GAMECONTAINER: HTMLDivElement                = document.querySelector<HTMLDivElement>("div.game-container div.game")!;
let USERSCONTAINER: HTMLDivElement               = document.querySelector<HTMLDivElement>("div.game-container div.user-list")!;

const FIRST_LINK: NodeListOf<HTMLAnchorElement> = document.querySelectorAll<HTMLAnchorElement>("nav div a[data-link]")!;
const HOME_LINK: HTMLAnchorElement              = document.querySelector<HTMLAnchorElement>("nav > a")!;

function regenerateButtons(): void {
    JOINGAMEQUEUEBUTTON             = document.querySelector<HTMLButtonElement>("div.game-container button.create-game")!;
    JOINTOURNAMENTQUEUEBUTTON       = document.querySelector<HTMLButtonElement>("div.game-container button.create-tournament")!;
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
    gs.requestJoinGameQueue();
}

async function createTournamentButtonCallback(): Promise<void> {
    let gs: GameSocket = await GameSocket.get();
    gs.requestJoinTournamentQueue();
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
function deactivateButtons(): void {
    JOINGAMEQUEUEBUTTON.removeEventListener("click", createGameButtonCallback);
    deactivateButton(JOINGAMEQUEUEBUTTON);
}

export {
    activateButtons,
    deactivateButtons,
    AVAILABLEGAMECONTAINER,
    AVAILABLETOURNAMENTCONTAINER,
    GAMECONTAINER,
    USERSCONTAINER
};