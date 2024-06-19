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
        this._canvas.style.backgroundColor = default_color;
        this._canvas.width = screenWidth;
        this._canvas.height = screenHeight;
        this._context = this._canvas.getContext("2d");
        this._currentPlayer = new CurrentPlayer("Player 1", new Position(8, 0));
        this._opponent = new Player("Player 2", new Position(screenWidth - 16, 0));
        this._ball = new Ball(new Position(0, 0));
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
    stop() {
        this._currentPlayer.stop();
        container.removeChild(this._canvas);
    }
    /**
     * Update the game state.
     * @param response
     * @private
     */
    update(response) {
        this._currentPlayer.position = new Position(response.data.p1.position[0], response.data.p1.position[1]);
        this._opponent.position = new Position(response.data.p2.position[0], response.data.p2.position[1]);
        this._ball.position = new Position(response.data.ball.position[0], response.data.ball.position[1]);
        this.display();
    }
    parseMessage(response) {
        console.log(response["method"]);
        if (response.method === "update_game") {
            this.update(response);
        }
    }
    _canvas;
    _context;
    _currentPlayer;
    _opponent;
    _ball;
}
export { Pong };
