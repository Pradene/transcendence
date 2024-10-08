import { Pong } from "./Pong.js";
import { activateButtons, AVAILABLEGAMECONTAINER, AVAILABLETOURNAMENTCONTAINER, USERSCONTAINER } from "./DomElements.js";
import { GAME_MODE } from "./Defines.js";
import {Router} from "../utils/Router";

const hosturl = "wss://" + location.hostname + ":" + location.port + "/ws/game/";

export class GameSocket {
    static #GameSocket = null;

    constructor(socket) {
        this._currentGame = null;

        this._websocket = socket;
        this._websocket.onmessage = this.redirectMessages
        this._websocket.onerror = (e) => {
            console.trace()
            console.error("Error: ", e);
        }
        this._websocket.onclose = () => {
            console.trace()
        }
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
        
        if (!response.status) {
            alert("Error: " + response.reason);
            return ;
        }

        const gameContainer = document.querySelector("div.game canvas")
        const leave_queue_event = new CustomEvent("leaveQueue", {detail: response})
        const join_queue_event = new CustomEvent("joinQueue", {detail: response});

        switch (response.method) {
            case "get_users":
                // this._gameSocket.processGetUsers(response);
                break;
            case "join_game":
                window.dispatchEvent(leave_queue_event);
                this.createNewGame(response);
                break;
            case "join_queue":
                document.dispatchEvent(join_queue_event)
                break;
            case "update_game":
                document.dispatchEvent(leave_queue_event)

                if (!this._currentGame)
                    this._currentGame = new Pong(gameContainer);

                this._currentGame.update(response);
                break;
            case "redirect_game":
                const url = response.url
                await Router.get().navigate(url)
                break;
        }
    }

    removeGame() {
        this._currentGame = null;
    }
    
    close() {
        this._currentGame?.stop();
        this.removeGame();

        // Remove all event listeners
        this._websocket.onclose = () => {};
        this._websocket.onerror = () => {};
        this._websocket.close();

        GameSocket.#GameSocket = null;

        console.log("Closing game socket");
    }
}
