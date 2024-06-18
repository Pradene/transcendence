import {
    STARTBUTTON,
    REFRESHBUTTON,
    activateButton,
    deactivateButton,
    startButtonCallback,
    refreshButtonCallback
}             from "./DomElements";
import {Pong} from "./Pong";

const hosturl: string = "ws://" + location.hostname + ":" + location.port + "/ws/game";

class GameSocket {
    private constructor() {
        this._websocket = new WebSocket(hosturl);

        this._websocket.onopen = () => {
            console.log("Connected to server");
            STARTBUTTON.addEventListener("click", startButtonCallback);
            REFRESHBUTTON.addEventListener("click", refreshButtonCallback);
            activateButton(STARTBUTTON);
            activateButton(REFRESHBUTTON);
        };
        this._websocket.onerror = (error) => {
            console.error("Error: " + error);
            STARTBUTTON.removeEventListener("click", startButtonCallback);
            REFRESHBUTTON.removeEventListener("click", refreshButtonCallback);
            deactivateButton(STARTBUTTON);
            deactivateButton(REFRESHBUTTON);
        }
        this._websocket.onmessage = (event) => {
            console.log("Message: " + event.data);
        }

        this._websocket.send("Hello from client");
    }

    public static get(): GameSocket {
        return GameSocket.#GameSocket;
    }

    public createGame(): Pong {
        return new Pong(this);
    }

    private _websocket: WebSocket;
    static #GameSocket: GameSocket = new GameSocket();
}

export {GameSocket};