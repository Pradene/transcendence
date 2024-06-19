import {Pong}                               from "./Pong";
import {activateButtons, deactivateButtons} from "./DomElements";
import {apicallresponse}                    from "./Api";

const hosturl: string = "ws://" + location.hostname + ":" + location.port + "/ws/game";

//connect to the server, on failure script will throw an error and die
const socket: WebSocket = await new Promise<WebSocket>((resolve, reject) => {
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
    private constructor() {
        this._websocket = socket;
        this._currentGame = null;
        this._websocket.onmessage = this.redirectMessages
    }

    /**
     * Access global GameSocket instance.
     */
    public static get(): GameSocket {
        return GameSocket.#GameSocket;
    }

    /**
     * Request the server to create a new game instance.
     */
    public createGame(): Pong {
        if (this._currentGame) {
            return this._currentGame;
        }

        this._websocket.send(JSON.stringify({method: "create_game"}));
        this._currentGame = new Pong();
        return this._currentGame;
    }

    /**
     * Parse messages from the server.
     * @param event
     */
    public redirectMessages(event: MessageEvent): void {
        console.log(event.data);
        let gs = GameSocket.get();
        let response = JSON.parse(event.data) as apicallresponse;
        console.log(response);
        //here global events
        switch (response.method) {
            case "get_games":
                break;
        }

        //here game events
        if (gs._currentGame) {
            gs._currentGame.parseMessage(response);
        }
    }

    private _websocket: WebSocket;
    private _currentGame: Pong | null;
    static #GameSocket: GameSocket = new GameSocket();
}

export {GameSocket};