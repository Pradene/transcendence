import {Pong}                                                             from "./Pong";
import {USERNAMEINPUT, activateButtons, deactivateButtons, ROOMCONTAINER} from "./DomElements";
import {
    apicallrequest,
    apicallresponse,
    create_game_request,
    create_game_response,
    get_games_request,
    get_games_response, join_game_request
} from "./Api";

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

        // setInterval(() => {
        //     this.requestGames();
        // }, 1000);
    }

    /**
     * Access global GameSocket instance.
     */
    public static get(): GameSocket {
        return GameSocket.#GameSocket;
    }

    /**
     * Request the server to send all currently running games.
     */
    public requestGames(): void {
        let request: get_games_request = {
            method: "get_games"
        };
        this.send(request);
    }

    private processGames(response: get_games_response): void {
        let games = response.data;

        ROOMCONTAINER.innerHTML = "";
        games.forEach(element => {
            let room = document.createElement("div");
            let creator = document.createElement("span");
            let player_count = document.createElement("span");
            let join = document.createElement("button");

            room.classList.add("room");
            creator.classList.add("gameid");
            player_count.classList.add("player-count");

            creator.textContent = element.creator;
            player_count.textContent = element.player_count + "/2";
            join.textContent = "Join";
            join.addEventListener("click", () => {
                let request: join_game_request = {
                    method: "join_game",
                    data: {
                        gameid: element.creator
                    }
                };
                this.send(request);
            });

            room.appendChild(creator);
            room.appendChild(player_count);
            room.appendChild(join);
            ROOMCONTAINER.appendChild(room);
        });
    }

    /**
     * Request the server to create a new game instance.
     */
    public requestNewGame(): void {
        if (this._currentGame) {
            return ;
        }

        let username = USERNAMEINPUT.value;
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
        if (!response.status) {
            console.error("Could not create new game: ", response.reason);
        } else {
            this._currentGame = new Pong();
        }
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
    public redirectMessages(event: MessageEvent): void {
        let gs = GameSocket.get();
        let response = JSON.parse(event.data) as apicallresponse;
        console.log("Received message", response);

        //here global events
        switch (response.method) {
            case "get_games":
                gs.processGames(response as get_games_response);
                break;
            case "create_game":
                gs.createNewGame(response as create_game_response);
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