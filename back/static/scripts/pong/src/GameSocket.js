import { Pong } from "./Pong";
import { USERNAMEINPUT, activateButtons, ROOMCONTAINER } from "./DomElements";
const hosturl = "ws://" + location.hostname + ":" + location.port + "/ws/game";
//connect to the server, on failure script will throw an error and die
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
class GameSocket {
    constructor() {
        this._websocket = socket;
        this._currentGame = null;
        this._websocket.onmessage = this.redirectMessages;
        // setInterval(() => {
        //     this.requestGames();
        // }, 1000);
    }
    /**
     * Access global GameSocket instance.
     */
    static get() {
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
    processGames(response) {
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
                let request = {
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
    requestNewGame() {
        if (this._currentGame) {
            return;
        }
        let username = USERNAMEINPUT.value;
        if (!username)
            return;
        let request = {
            method: "create_game",
            data: {
                username: username
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
        else {
            this._currentGame = new Pong();
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
    redirectMessages(event) {
        let gs = GameSocket.get();
        let response = JSON.parse(event.data);
        console.log("Received message", response);
        //here global events
        switch (response.method) {
            case "get_games":
                gs.processGames(response);
                break;
            case "create_game":
                gs.createNewGame(response);
                break;
        }
        //here game events
        if (gs._currentGame) {
            gs._currentGame.parseMessage(response);
        }
    }
    _websocket;
    _currentGame;
    static #GameSocket = new GameSocket();
}
export { GameSocket };
