import {Pong}                               from "./Pong";
import {USERNAMEINPUT, activateButtons, deactivateButtons} from "./DomElements";
import {apicallrequest, apicallresponse, create_game_request, create_game_response}                    from "./Api";

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
    public requestNewGame(): void {
        if (this._currentGame) {
            return ;
        }

        let username = USERNAMEINPUT.textContent;
        if (!username)
            return ;

        let request: create_game_request = {
            method: "create_game",
            data: {
                username: username
            }
        }
        this.send(request);
    }

    /**
     * Create a new game
     * @param response 
     */
    private createNewGame(response: create_game_response): void {
        if (response.status !== true) {
            this._currentGame = new Pong();
        } else {
            console.error("Could not create new game: ", response.reason);
        }
    }

    /**
     * Send a request to the server
     * @param request The request to be send
     */
    public send(request: apicallrequest): void {
        this._websocket.send(JSON.stringify(request));
    }

    /**
     * Parse messages from the server.
     * @param event
     */
    public redirectMessages(event: MessageEvent): void {
        let gs = GameSocket.get();
        let response = JSON.parse(event.data) as apicallresponse;
        console.log(response);

        //here global events
        switch (response.method) {
            case "get_games":
                break;
            case "create_game":
                this.createNewGame(response as create_game_response);
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