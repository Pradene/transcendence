import { Pong } from "./Pong";
import { activateButtons, AVAILABLEGAMECONTAINER, AVAILABLETOURNAMENTCONTAINER, USERSCONTAINER } from "./DomElements";
import { GAME_MODE } from "./Defines";
const hosturl = "wss://" + location.hostname + ":" + location.port + "/ws/game";
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
    /**
     * Request the server to send all currently running games.
     */
    requestGames() {
        let request = {
            method: "get_games"
        };
        this.send(request);
    }
    processGetUsers(response) {
        USERSCONTAINER.innerHTML = "<h2>Users:</h2>";
        response.data.users.forEach((element) => {
            let user = document.createElement("p");
            user.textContent = element;
            USERSCONTAINER.appendChild(user);
        });
    }
    processGetGames(response) {
        let games = response.data.games;
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
        });
    }
    processOneGame(creator, player_count, is_full) {
        let game_container = document.createElement("div");
        let creator_element = document.createElement("span");
        let player_count_element = document.createElement("span");
        let join_button = document.createElement("button");
        game_container.classList.add("room");
        creator_element.classList.add("gameid");
        player_count_element.classList.add("player-count");
        creator_element.textContent = creator;
        player_count_element.textContent = player_count + "/2";
        join_button.textContent = "Join";
        join_button.addEventListener("click", () => {
            let request = {
                method: "join_game",
                data: {
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
    processOneTournament(creator, player_count, is_full) {
        let tournament_container = document.createElement("div");
        let creator_element = document.createElement("span");
        let player_count_element = document.createElement("span");
        let join_button = document.createElement("button");
        tournament_container.classList.add("room");
        creator_element.classList.add("gameid");
        player_count_element.classList.add("player-count");
        creator_element.textContent = creator;
        player_count_element.textContent = player_count + "/4";
        join_button.textContent = "Join";
        join_button.addEventListener("click", () => {
            let request = {
                method: "join_game",
                data: {
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
    requestNewGame() {
        console.log("Requesting new game");
        if (this._currentGame) {
            console.error("Already in a game");
            return;
        }
        let request = {
            method: "create_game",
            data: {
                mode: GAME_MODE.NONE
            }
        };
        this.send(request);
    }
    requestNewTournament() {
        if (this._currentGame) {
            return;
        }
        let request = {
            method: "create_tournament",
            data: {
                mode: GAME_MODE.NONE
            }
        };
        this.send(request);
    }
    /**
     * Create a new game
     * @param response
     */
    createNewGame(response) {
        if (!response.status) {
            console.error("Could not create new game: ", response.reason);
        }
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
            case "get_games":
                gs.processGetGames(response);
                break;
            case "get_users":
                gs.processGetUsers(response);
                break;
            case "create_game":
                gs.createNewGame(response);
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
