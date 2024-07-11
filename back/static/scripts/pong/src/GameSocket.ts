import {Pong}      from "./Pong";
import {
    activateButtons,
    AVAILABLEGAMECONTAINER,
    AVAILABLETOURNAMENTCONTAINER
}                  from "./DomElements";
import {
    apicallrequest,
    apicallresponse,
    create_game_request,
    create_game_response, create_tournament_request,
    get_games_request,
    get_games_response, join_game_request, update_game_response
} from "./Api";

const hosturl: string = "ws://" + location.hostname + ":" + location.port + "/ws/game";

//connect to the server, on failure script will throw an error and die
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

class GameSocket {
    private constructor() {
        this._websocket           = socket;
        this._currentGame         = null;
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

    private processGetGames(response: get_games_response): void {
        let games       = response.data.games;
        let tournaments = response.data.tournaments;

        // clean containers
        AVAILABLEGAMECONTAINER.innerHTML = "";
        AVAILABLETOURNAMENTCONTAINER.innerHTML = "";

        // insert elements
        games.forEach(element => {
            this.processOneGame(element.creator, element.player_count, element.is_full);
        });
        tournaments.forEach(element => {
            this.processOneTournament(element.creator, element.player_count, element.is_full);
        })
    }

    private processOneGame(creator: string, player_count: number, is_full: boolean): void {
        let game_container       = document.createElement("div");
        let creator_element      = document.createElement("span");
        let player_count_element = document.createElement("span");
        let join_button          = document.createElement("button");

        game_container.classList.add("room");
        creator_element.classList.add("gameid");
        player_count_element.classList.add("player-count");

        creator_element.textContent      = creator;
        player_count_element.textContent = player_count + "/2";
        join_button.textContent          = "Join";
        join_button.addEventListener("click", () => {
            let request: join_game_request = {
                method: "join_game",
                data:   {
                    gameid: creator
                }
            };
            this.send(request);
        });
        join_button.disabled = is_full;

        game_container.appendChild(creator_element);
        game_container.appendChild(player_count_element);
        game_container.appendChild(join_button);
        AVAILABLEGAMECONTAINER.appendChild(game_container);
    }

    private processOneTournament(creator: string, player_count: number, is_full: boolean): void {
        let tournament_container = document.createElement("div");
        let creator_element      = document.createElement("span");
        let player_count_element = document.createElement("span");
        let join_button          = document.createElement("button");

        tournament_container.classList.add("room");
        creator_element.classList.add("gameid");
        player_count_element.classList.add("player-count");

        creator_element.textContent      = creator;
        player_count_element.textContent = player_count + "/4";
        join_button.textContent          = "Join";
        join_button.addEventListener("click", () => {
            let request: join_game_request = {
                method: "join_game",
                data:   {
                    gameid: creator
                }
            };
            this.send(request);
        });
        join_button.disabled = is_full;

        tournament_container.appendChild(creator_element);
        tournament_container.appendChild(player_count_element);
        tournament_container.appendChild(join_button);
        AVAILABLETOURNAMENTCONTAINER.appendChild(tournament_container);
    }

    /**
     * Request the server to create a new game instance.
     */
    public requestNewGame(): void {
        console.log("Requesting new game")
        if (this._currentGame) {
            console.error("Already in a game")
            return;
        }

        let request: create_game_request = {
            method: "create_game",
            data:   {
            }
        }
        this.send(request);
    }

    public requestNewTournament(): void {
        if (this._currentGame) {
            return;
        }

        let request: create_tournament_request = {
            method: "create_tournament",
            data:   {
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
        let gs       = GameSocket.get();
        let response = JSON.parse(event.data) as apicallresponse;
        console.log("Received message", response);

        //check for error
        if (!response.status) {
            alert("Error: " + response.reason);
            return;
        }

        //here global events
        switch (response.method) {
            case "get_games":
                gs.processGetGames(response as get_games_response);
                break;
            case "create_game":
                gs.createNewGame(response as create_game_response);
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

    private _websocket: WebSocket;
    private _currentGame: Pong | null;
    static #GameSocket: GameSocket = new GameSocket();
}

export {GameSocket};