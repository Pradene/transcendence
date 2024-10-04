import { Pong } from "./Pong.js";
import { activateButtons, AVAILABLEGAMECONTAINER, AVAILABLETOURNAMENTCONTAINER, USERSCONTAINER } from "./DomElements.js";
import { GAME_MODE } from "./Defines.js";

const hosturl = "wss://" + location.hostname + ":" + location.port + "/ws/game/";

export class GameSocket {
    static #GameSocket = null;

    constructor(socket) {
        this._currentGame = null;

        this._websocket = socket;
        this._websocket.onmessage = this.redirectMessages
    }

    /**
     * Access global GameSocket instance.
     */
    static async get() {
        if (GameSocket.#GameSocket === null) {
            const socket = await new Promise((resolve, reject) => {
                console.log("Connecting to server...");
                let ws = new WebSocket(hosturl);

                ws.onopen = () => {
                    resolve(ws);
                };
                
                ws.onerror = (e) => {
                    reject(e);
                };

            }).then((ws) => {
                console.log("Connected to server.");
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

    requestJoinGameQueue() {
        console.log("Requesting new game")

        if (this._currentGame) {
            console.error("Already in a game")
            return;
        }

        let request = {
            method: "join_queue",
            data:   {
                mode: "game"
            }
        }

        this.send(request);
    }

    requestJoinTournamentQueue() {
        console.log("Requesting new tournament")

        if (this._currentGame) {
            return;
        }

        let request = {
            method: "join_queue",
            data:   {
                mode: "tournament"
            }
        }

        this.send(request);
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
        let response = JSON.parse(event.data);
        //console.log("Received message", response);
        
        if (!response.status) {
            alert("Error: " + response.reason);
            return ;
        }

        const e = new CustomEvent("gameMessage", {
            detail: {
                data: response
            }
        })

        window.dispatchEvent(e)
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
}
