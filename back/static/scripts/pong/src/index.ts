import {Pong} from './Pong';

let pong: Pong | null = null;

//UI elements
const startButton: HTMLButtonElement   = document.querySelector("div.game-container button.create-game")!;
const refreshButton: HTMLButtonElement = document.querySelector("div.game-container button.refresh-room")!;

function activateButton(button: HTMLButtonElement): void {
    button.classList.add("active");
}

function deactivateButton(button: HTMLButtonElement): void {
    button.classList.remove("active");
}

/**
 * Create a new game.
 */
function createGame(): void {
    if (pong)
        pong.stop();
    pong = new Pong(websocket);
    pong.display();
}

/**
 * Refresh the room.
 */
function refreshRoom(): void {
}

//create websocket and wait for connection success or disconnection
const websocket: WebSocket           = new WebSocket("ws://localhost:8000/ws/game");
let connectionIntervalID: number     = 0;
let connectionLostIntervalID: number = 0;

function connectionCallback(event: Event): void {
    if (websocket.readyState === WebSocket.OPEN) {
        console.log("Connection established");
        clearInterval(connectionIntervalID);
        connectionLostIntervalID = setInterval(connectionLostCallback, 1000);
        activateButton(startButton);
        activateButton(refreshButton);
        startButton.addEventListener("click", createGame);
        refreshButton.addEventListener("click", refreshRoom);
        refreshRoom();
    } else {
        console.log("Connecting...");
    }
}

function connectionLostCallback(event: Event): void {
    if (websocket.readyState === WebSocket.CLOSED || websocket.readyState === WebSocket.CLOSING) {
        clearInterval(connectionLostIntervalID);
        connectionIntervalID = setInterval(connectionCallback, 1000);
        deactivateButton(startButton);
        deactivateButton(refreshButton);
        startButton.removeEventListener("click", createGame);
        refreshButton.removeEventListener("click", refreshRoom);
        console.log("Connection lost");
    }
}

connectionIntervalID     = setInterval(connectionCallback, 1000);