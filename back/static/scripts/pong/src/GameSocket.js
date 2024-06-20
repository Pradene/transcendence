import { Pong } from "./Pong";
import { activateButtons } from "./DomElements";
const hosturl = "ws://" + location.hostname + ":" + location.port + "/ws/game";
//connect to the server, on failure script will throw an error and die
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
class GameSocket {
    constructor() {
        this._websocket = socket;
        this._currentGame = null;
        this._websocket.onmessage = this.redirectMessages;
    }
    /**
     * Access global GameSocket instance.
     */
    static get() {
        return GameSocket.#GameSocket;
    }
    /**
     * Request the server to create a new game instance.
     */
    requestNewGame() {
        if (this._currentGame) {
            return;
        }
        let request = {
            method: "create_game",
            data: {
                username: "username"
            }
        };
        this.send(request);
    }
    createNewGame(response) {
        if (response.status !== true) {
            this._currentGame = new Pong();
        }
        else {
            console.error("Could not create new game: ", response.reason);
        }
    }
    /**
     * Send a request to the server
     * @param request The request to be send
     */
    send(request) {
        this._websocket.send(JSON.stringify(request));
    }
    /**
     * Parse messages from the server.
     * @param event
     */
    redirectMessages(event) {
        let gs = GameSocket.get();
        let response = JSON.parse(event.data);
        console.log(response);
        //here global events
        switch (response.method) {
            case "get_games":
                break;
            case "create_game":
                this.createNewGame(response);
                break;
        }
        //here game events
        if (gs._currentGame) {
            gs._currentGame.parseMessage(response);
        }
    }
    _websocket;
    _currentGame;
    static #GameSocket = new GameSocket();
}
export { GameSocket };
