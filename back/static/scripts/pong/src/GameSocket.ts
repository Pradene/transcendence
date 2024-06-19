import {Pong}                               from "./Pong";
import {activateButtons, deactivateButtons} from "./DomElements";

const hosturl: string = "ws://" + location.hostname + ":" + location.port + "/ws/game";

class GameSocket {
    private constructor() {
        this._websocket = null;

        console.log("Connecting to " + hosturl + "...");
        new Promise<WebSocket>((resolve, reject) => {
            let ws: WebSocket = new WebSocket(hosturl);

            ws.onopen    = () => {
                resolve(ws);
            };
            ws.onerror   = (err: any) => {
                console.error("Connection failed");
                deactivateButtons();
                reject(err);
            };
            ws.onclose   = (event: any) => {
                console.log("Connection closed");
                deactivateButtons();
            };
            ws.onmessage = (event: any) => {
                console.log("Received message: " + event.data);
            };
        }).then((ws: WebSocket) => {
            this._websocket = ws;
            console.log("Connection established");
            activateButtons();
        }).catch((err: Event) => {
            console.error(err);
            deactivateButtons();
        });
    }

    public static get(): GameSocket {
        return GameSocket.#GameSocket;
    }

    public createGame(): Pong {
        if (this._websocket === null) {
            throw new Error("No connection");
        }

        this._websocket.send("create");
        return new Pong(this);
    }

    private _websocket: WebSocket | null;
    static #GameSocket: GameSocket = new GameSocket();
}

export {GameSocket};