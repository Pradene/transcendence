import { CurrentPlayer, Player } from "./Player";
import { Ball } from "./Ball";
import { Position } from "./Utils";
const screenWidth = 800;
const screenHeight = 600;
const default_color = "#ffffff";
const container = document.querySelector("div.game-container div.game");
class Pong {
    constructor(sock) {
        this._canvas = document.createElement("canvas");
        this._canvas.style.backgroundColor = default_color;
        this._canvas.width = screenWidth;
        this._canvas.height = screenHeight;
        this._context = this._canvas.getContext("2d");
        this._currentPlayer = new CurrentPlayer("Player 1", new Position(8, 0));
        this._opponent = new Player("Player 2", new Position(screenWidth - 16, 0));
        this._ball = new Ball(new Position(0, 0));
        this._websocket = sock;
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
    _canvas;
    _context;
    _currentPlayer;
    _opponent;
    _ball;
    _websocket;
}
export { Pong };
