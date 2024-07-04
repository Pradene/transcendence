import { CurrentPlayer, Player } from "./Player.js";
import { Ball } from "./Ball.js";
import { Position } from "./Utils.js";
import { GameSocket } from "./GameSocket.js";
import { ThreeD } from "./3D.js";
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
		this._renderer = new ThreeD();
		this._renderer.initThreejs()
        container.appendChild(this._canvas);
    }
    /**
     * Display the game
     */
    display() {
        this._context.clearRect(0, 0, screenWidth, screenHeight);
		this._renderer.render(this._current_player._position[0], this._current_player._position[1], this._opponent._position[0], this._opponent._position[1], this._ball._position[0], this._ball._position[1])
/*         this._current_player?.display(this._context);
        this._opponent?.display(this._context);
        this._ball.display(this._context); */
    }
    /**
     * Stop the game
     */
    stop() {
        this._current_player?.stop();
        container.removeChild(this._canvas);
        GameSocket.get().removeGame();
    }
    /**
     * Update the game data and display it.
     * @param response
     * @private
     */
    update(response) {
        if (!this._current_player) {
            this._current_player = new CurrentPlayer("a name", new Position(0, 0));
            this._opponent = new Player("another name", new Position(0, 0));
        }
        if (response.data.status === "finished") {
            this.stop();
        }
        this._current_player?.setPositionFromArray(response.data.current_player.position);
        this._opponent?.setPositionFromArray(response.data.opponent.position);
        this._current_player?.setScore(response.data.current_player.score);
        this._opponent?.setScore(response.data.opponent.score);
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
