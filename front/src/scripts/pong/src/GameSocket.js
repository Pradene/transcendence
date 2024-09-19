import { Pong } from "./Pong";
import { activateButtons, USERSCONTAINER } from "./DomElements";
const hosturl = "wss://" + location.hostname + ":" + location.port + "/ws/game/";
class GameSocket {
    constructor(socket) {
        this._websocket = socket;
        this._currentGame = null;
        this._websocket.onmessage = this.redirectMessages;
    }
    /**
     * Access global GameSocket instance.
     */
    static async get() {
        if (GameSocket.#GameSocket === null) {
            const socket = await new Promise((resolve, reject) => {
                let ws = new WebSocket(hosturl);
                console.log("Connecting to server...");
                ws.onopen = () => {
                    resolve(ws);
                };
                ws.onerror = (e) => {
                    reject(e);
                };
            }).then((ws) => {
                console.log("Connected to server.");
                activateButtons();
                return ws;
            }).catch((e) => {
                throw new Error("Failed to connect to server: " + e);
            });
            this.#GameSocket = new GameSocket(socket);
        }
        return GameSocket.#GameSocket;
    }
    processGetUsers(response) {
        USERSCONTAINER.innerHTML = "<h2>Users:</h2>";
        response.data.users.forEach((element) => {
            let user = document.createElement("p");
            user.textContent = element;
            USERSCONTAINER.appendChild(user);
        });
    }
    /**
     * Request the server to create a new game instance.
     */
    requestJoinGameQueue() {
        console.log("Requesting new game");
        if (this._currentGame) {
            console.error("Already in a game");
            return;
        }
        let request = {
            method: "join_queue",
            data: {
                mode: "game"
            }
        };
        this.send(request);
    }
    requestJoinTournamentQueue() {
        if (this._currentGame) {
            return;
        }
        let request = {
            method: "join_queue",
            data: {
                mode: "tournament"
            }
        };
        this.send(request);
    }
    /**
     * Send a request to the server
     * @param request The request to be send
     */
    send(request) {
        console.log("Sending request: ", request);
        this._websocket.send(JSON.stringify(request));
    }
    /**
     * Parse messages from the server.
     * @param event
     */
    async redirectMessages(event) {
        let gs = await GameSocket.get();
        let response = JSON.parse(event.data);
        console.log("Received message", response);
        //check for error
        if (!response.status) {
            alert("Error: " + response.reason);
            return;
        }
        //here global events
        switch (response.method) {
            case "get_users":
                gs.processGetUsers(response);
                break;
            case "join_queue":
                let joinResponse = response;
                if (!joinResponse.status) {
                    alert("Error: " + joinResponse.reason);
                }
                break;
            case "update_game":
                if (!gs._currentGame)
                    gs._currentGame = new Pong();
                break;
        }
        //here game events
        if (gs._currentGame) {
            gs._currentGame.parseMessage(response);
        }
    }
    removeGame() {
        this._currentGame = null;
    }
    close() {
        this._currentGame?.stop();
        this.removeGame();
        this._websocket.close();
        GameSocket.#GameSocket = null;
        console.log("Closing game socket");
    }
    _websocket;
    _currentGame;
    static #GameSocket = null;
}
export { GameSocket };
