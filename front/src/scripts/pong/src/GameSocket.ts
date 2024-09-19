import {Pong}      from "./Pong";
import {
    activateButtons,
    AVAILABLEGAMECONTAINER,
    AVAILABLETOURNAMENTCONTAINER, USERSCONTAINER
}                  from "./DomElements";
import {
    apicallrequest,
    apicallresponse,
    get_users_request,
    join_queue_request,
    join_queue_response,
    leave_queue_request,
    leave_queue_response
}                  from "./Api";
import {GAME_MODE} from "./Defines";

const hosturl: string = "wss://" + location.hostname + ":" + location.port + "/ws/game/";


class GameSocket {
    private constructor(socket: WebSocket) {
        this._websocket           = socket;
        this._currentGame         = null;
        this._websocket.onmessage = this.redirectMessages
    }

    /**
     * Access global GameSocket instance.
     */
    public static async get(): Promise<GameSocket> {
        if (GameSocket.#GameSocket === null) {
            const socket: WebSocket = await new Promise<WebSocket>((resolve, reject) => {
                let ws = new WebSocket(hosturl);
                console.log("Connecting to server...");
                ws.onopen  = () => {
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
            }) as WebSocket;

            this.#GameSocket = new GameSocket(socket);
        }

        return GameSocket.#GameSocket!;
    }

    private processGetUsers(response: get_users_request): void {
        USERSCONTAINER.innerHTML = "<h2>Users:</h2>";

        response.data.users.forEach((element) => {
            let user         = document.createElement("p");
            user.textContent = element;
            USERSCONTAINER.appendChild(user);
        });
    }

    /**
     * Request the server to create a new game instance.
     */
    public requestJoinGameQueue(): void {
        console.log("Requesting new game")
        if (this._currentGame) {
            console.error("Already in a game")
            return;
        }

        let request: join_queue_request = {
            method: "join_queue",
            data:   {
                mode: "game"
            }
        }
        this.send(request);
    }

    public requestJoinTournamentQueue(): void {
        if (this._currentGame) {
            return;
        }

        let request: join_queue_request = {
            method: "join_queue",
            data:   {
                mode: "tournament"
            }
        }
        this.send(request);
    }

    /**
     * Send a request to the server
     * @param request The request to be send
     */
    public send(request: apicallrequest): void {
        console.log("Sending request: ", request);
        this._websocket.send(JSON.stringify(request));
    }

    /**
     * Parse messages from the server.
     * @param event
     */
    public async redirectMessages(event: MessageEvent): Promise<void> {
        let gs       = await GameSocket.get();
        let response = JSON.parse(event.data) as apicallresponse;



        console.log("Received message", response);

        //check for error
        if (!response.status) {
            alert("Error: " + response.reason);
            return;
        }

        //here global events
        switch (response.method) {
            case "get_users":
                gs.processGetUsers(response as get_users_request);
                break;
            case "join_queue":
                let joinResponse = response as join_queue_response;
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

    public removeGame(): void {
        this._currentGame = null;
    }

    public close(): void {
        this._currentGame?.stop();
        this.removeGame();
        this._websocket.close();
        GameSocket.#GameSocket = null;

        console.log("Closing game socket");
    }

    private _websocket: WebSocket;
    private _currentGame: Pong | null;
    static #GameSocket: GameSocket | null = null;
}

export {GameSocket};