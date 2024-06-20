import {GameSocket} from "./GameSocket";

const STARTBUTTON: HTMLButtonElement   = document.querySelector("div.game-container button.create-game")!;
const REFRESHBUTTON: HTMLButtonElement = document.querySelector("div.game-container button.refresh-room")!;
const USERNAMEINPUT: HTMLInputElement   = document.querySelector("div.game-container #username")!;

function startButtonCallback(): void {
    GameSocket.get().requestNewGame();
}

function refreshButtonCallback(): void {}

function joinButtonCallback(): void {}

function activateButton(button: HTMLButtonElement): void {
    button.classList.add("active");
}

function deactivateButton(button: HTMLButtonElement): void {
    button.classList.remove("active");
}

function activateButtons(): void {
    STARTBUTTON.addEventListener("click", startButtonCallback);
    REFRESHBUTTON.addEventListener("click", refreshButtonCallback);
    activateButton(STARTBUTTON);
    activateButton(REFRESHBUTTON);
}

function deactivateButtons(): void {
    STARTBUTTON.removeEventListener("click", startButtonCallback);
    REFRESHBUTTON.removeEventListener("click", refreshButtonCallback);
    deactivateButton(STARTBUTTON);
    deactivateButton(REFRESHBUTTON);
}

export {activateButtons, deactivateButtons};