import {CurrentPlayer, Player}                 from "./Player";
import {Ball}                                  from "./Ball";
import {Position}                              from "./Utils";
import {apicallresponse, update_game_response} from "./Api";

const screenWidth: number = 800;
const screenHeight: number = 600;
const default_color: string = "#ffffff";
const container: HTMLDivElement = document.querySelector("div.game-container div.game")!;

class Pong {
    constructor() {
        this._current_player = undefined;
        this._opponent = undefined;
        this._canvas = document.createElement("canvas");
        this._context = this._canvas.getContext("2d")!;
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
    public display(): void {
        this._context.clearRect(0, 0, screenWidth, screenHeight);
        this._current_player?.display(this._context);
        this._opponent?.display(this._context);
        this._ball.display(this._context);
    }

    /**
     * Stop the game
     */
    private stop(): void {
        this._current_player?.stop();
        container.removeChild(this._canvas);
    }

    /**
     * Update the game data and display it.
     * @param response
     * @private
     */
    private update(response: update_game_response): void {
        if (!this._current_player) {
            this._current_player = new CurrentPlayer("a name", new Position(0, 0));
            this._opponent = new Player("another name", new Position(0, 0));
        }

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
    public parseMessage(response: apicallresponse): void {
        console.log(response["method"]);

        switch (response.method) {
            case "update_game":
                this.update(response as update_game_response);
                break;
            default:
                break;
        }
    }

    private get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    public get running(): boolean {
        return this._running
    }

    private set running(status: boolean) {
        if (!this.running && status) {
            //TODO start game (player key input catch)
            this._running = true;
        } else if (this.running && !status) {
            this.stop(); //game is not running anymore
            this._running = false
        }
    }

    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;
    private _current_player: CurrentPlayer | undefined;
    private _opponent: Player | undefined;
    private _ball: Ball;
    private _running: boolean;
}

export {Pong} ;