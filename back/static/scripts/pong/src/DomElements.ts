import {GameSocket} from "./GameSocket";

const STARTBUTTON: HTMLButtonElement   = document.querySelector("div.game-container button.create-game")!;
const REFRESHBUTTON: HTMLButtonElement = document.querySelector("div.game-container button.refresh-room")!;

function activateButton(button: HTMLButtonElement): void {
    button.classList.add("active");
}

function deactivateButton(button: HTMLButtonElement): void {
    button.classList.remove("active");
}

function startButtonCallback(): void {
    GameSocket.get().createGame();
}

function refreshButtonCallback(): void {}

function joinButtonCallback(): void {}

export {STARTBUTTON, REFRESHBUTTON, activateButton, deactivateButton, startButtonCallback, refreshButtonCallback};