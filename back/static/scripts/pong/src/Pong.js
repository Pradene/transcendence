import { CurrentPlayer, Player } from "./Player";
import { Ball } from "./Ball";
import { Position } from "./Utils";
const screenWidth = 800;
const screenHeight = 600;
const default_color = "#ffffff";
const container = document.querySelector("div.game-container div.game");
class Pong {
    constructor() {
        this._canvas = document.createElement("canvas");
        this._context = this._canvas.getContext("2d");
        this._currentPlayer = new CurrentPlayer("Player 1", new Position(8, 0));
        this._opponent = new Player("Player 2", new Position(screenWidth - 16, 0));
        this._ball = new Ball(new Position(0, 0));
        this._running = false;
        this._canvas.style.backgroundColor = default_color;
        this._canvas.width = screenWidth;
        this._canvas.height = screenHeight;
        container.appendChild(this._canvas);
    }
    /**
     * Display the game
     */
    display() {
        this._currentPlayer.display(this._context);
        this._opponent.display(this._context);
        this._ball.display(this._context);
    }
    get canvas() {
        return this._canvas;
    }
    /**
     * Stop the game
     */
    stop() {
        this._currentPlayer.stop();
        container.removeChild(this._canvas);
    }
    /**
     * Update the game data and display it.
     * @param response
     * @private
     */
    update(response) {
        let players = response.data.players;
        //update players and ball position
        players.forEach(element => {
            if (element.name === this._currentPlayer.name)
                this._currentPlayer.setPositionFromArray(element.position);
            else if (element.name === this._opponent.name)
                this._opponent.setPositionFromArray(element.position);
            else
                console.error("Invalid username: ", element.name);
        });
        this._ball.position = new Position(response.data.ball.position[0], response.data.ball.position[1]);
        this._running = response.data.status === "running";
        //now redisplay the game
        this.display(); //TODO change this to be called by an interval instead
    }
    /**
     * Parse a response from the server meant for the game
     * @param response
     */
    parseMessage(response) {
        console.log(response["method"]);
        switch (response.method) {
            case "update_game":
                this.update(response);
                break;
            default:
                throw new Error("Unexpected server response, killing script now");
        }
    }
    get running() {
        return this._running;
    }
    set running(status) {
        if (!this.running && status) {
            //TODO start game (player key input catch)
            this._running = true;
        }
        else if (this.running && !status) {
            this.stop(); //game is not running anymore
            this._running = false;
        }
    }
    _canvas;
    _context;
    _currentPlayer;
    _opponent;
    _ball;
    _running;
}
export { Pong };
