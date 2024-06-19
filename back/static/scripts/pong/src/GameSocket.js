import { Pong } from "./Pong";
import { activateButtons, deactivateButtons } from "./DomElements";
const hosturl = "ws://" + location.hostname + ":" + location.port + "/ws/game";
class GameSocket {
    constructor() {
        this._websocket = null;
        console.log("Connecting to " + hosturl + "...");
        new Promise((resolve, reject) => {
            let ws = new WebSocket(hosturl);
            ws.onopen = () => {
                resolve(ws);
            };
            ws.onerror = (err) => {
                console.error("Connection failed");
                deactivateButtons();
                reject(err);
            };
            ws.onclose = (event) => {
                console.log("Connection closed");
                deactivateButtons();
            };
            ws.onmessage = (event) => {
                console.log("Received message: " + event.data);
            };
        }).then((ws) => {
            this._websocket = ws;
            console.log("Connection established");
            activateButtons();
        }).catch((err) => {
            console.error(err);
            deactivateButtons();
        });
    }
    static get() {
        return GameSocket.#GameSocket;
    }
    createGame() {
        if (this._websocket === null) {
            throw new Error("No connection");
        }
        this._websocket.send("create");
        return new Pong(this);
    }
    _websocket;
    static #GameSocket = new GameSocket();
}
export { GameSocket };
