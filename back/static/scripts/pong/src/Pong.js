import { Ball } from "./Ball";
import { Position } from "./Utils";
const screenWidth = 800;
const screenHeight = 600;
const default_color = "#ffffff";
const container = document.querySelector("div.game-container div.game");
class Pong {
    constructor() {
        this._current_player = undefined;
        this._opponent = undefined;
        this._canvas = document.createElement("canvas");
        this._context = this._canvas.getContext("2d");
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
        this._context.clearRect(0, 0, screenWidth, screenHeight);
        this._current_player?.display(this._context);
        this._opponent?.display(this._context);
        this._ball.display(this._context);
    }
    /**
     * Stop the game
     */
    stop() {
        this._current_player?.stop();
        container.removeChild(this._canvas);
    }
    /**
     * Update the game data and display it.
     * @param response
     * @private
     */
    update(response) {
        this._current_player?.setPositionFromArray(response.data.current_player);
        this._opponent?.setPositionFromArray(response.data.opponent);
        this._ball.position = new Position(response.data.ball[0], response.data.ball[1]);
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
                break;
        }
    }
    get canvas() {
        return this._canvas;
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
    _current_player;
    _opponent;
    _ball;
    _running;
}
export { Pong };
