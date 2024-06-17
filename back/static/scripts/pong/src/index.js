"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Pong_1 = require("./Pong");
let pong = null;
//UI elements
const startButton = document.querySelector("div.game-container button.create-game");
const refreshButton = document.querySelector("div.game-container button.refresh-room");
function activateButton(button) {
    button.classList.add("active");
}
function deactivateButton(button) {
    button.classList.remove("active");
}
/**
 * Create a new game.
 */
function createGame() {
    if (pong)
        pong.stop();
    pong = new Pong_1.Pong(websocket);
    pong.display();
}
/**
 * Refresh the room.
 */
function refreshRoom() {
}
//create websocket and wait for connection success or disconnection
const websocket = new WebSocket("ws://localhost:8000/ws/game");
let connectionIntervalID = 0;
let connectionLostIntervalID = 0;
function connectionCallback(event) {
    if (websocket.readyState === WebSocket.OPEN) {
        console.log("Connection established");
        clearInterval(connectionIntervalID);
        connectionLostIntervalID = setInterval(connectionLostCallback, 1000);
        activateButton(startButton);
        activateButton(refreshButton);
        startButton.addEventListener("click", createGame);
        refreshButton.addEventListener("click", refreshRoom);
        refreshRoom();
    }
    else {
        console.log("Connecting...");
    }
}
function connectionLostCallback(event) {
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
connectionIntervalID = setInterval(connectionCallback, 1000);
