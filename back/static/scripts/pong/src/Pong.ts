import {CurrentPlayer, Player} from "./Player";
import {Ball}                  from "./Ball";
import {Position}              from "./Utils";
import {GameSocket}            from "./GameSocket";

const screenWidth: number            = 800;
const screenHeight: number           = 600;
const default_color: string          = "#ffffff";
const container: HTMLDivElement      = document.querySelector("div.game-container div.game")!;

class Pong {
    constructor(sock: GameSocket) {
        this._canvas                       = document.createElement("canvas");
        this._canvas.style.backgroundColor = default_color;
        this._canvas.width                 = screenWidth;
        this._canvas.height                = screenHeight;
        this._context                      = this._canvas.getContext("2d")!;
        this._currentPlayer                = new CurrentPlayer("Player 1", new Position(8, 0));
        this._opponent                     = new Player("Player 2", new Position(screenWidth - 16, 0));
        this._ball                         = new Ball(new Position(0, 0));
        this._websocket                    = sock;

        container.appendChild(this._canvas);
    }

    /**
     * Display the game
     */
    display(): void {
        this._currentPlayer.display(this._context);
        this._opponent.display(this._context);
        this._ball.display(this._context);
    }

    get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    stop(): void {
        this._currentPlayer.stop();
        container.removeChild(this._canvas);
    }

    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;
    private _currentPlayer: CurrentPlayer;
    private _opponent: Player;
    private _ball: Ball;
    private _websocket: GameSocket;
}

export {Pong} ;