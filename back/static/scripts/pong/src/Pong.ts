import {CurrentPlayer, Player}                 from "./Player";
import {Ball}                                  from "./Ball";
import {Position}                              from "./Utils";
import {apicallresponse, update_game_response} from "./Api";
import {GameSocket}                            from "./GameSocket";
import {GAMECONTAINER}                         from "./DomElements";

const screenWidth: number  = 800;
const screenHeight: number = 600;
const colors: any          = {
    waiting: {
        background: "#000000",
        border:     "#ffffff",
        text:       "#ffffff"
    },
    running: {
        background: "#ffffff",
        text:       "#000000",
        player:     "#000000",
    }
};

class Pong {
    constructor() {
        this._current_player = undefined;
        this._opponent       = undefined;
        this._canvas         = document.createElement("canvas");
        this._context        = this._canvas.getContext("2d")!;
        this._ball           = new Ball(new Position(0, 0));
        this._running        = false;

        //set the canvas properties
        this._canvas.style.backgroundColor = colors.waiting.background;
        this._canvas.style.border          = "solid 1px " + colors.waiting.border;
        this._canvas.width                 = screenWidth;
        this._canvas.height                = screenHeight;

        GAMECONTAINER.appendChild(this._canvas);
    }

    /**
     * Display the game
     */
    public display(status: boolean, timer?: number): void {
        if (!status) {
            this._canvas.style.backgroundColor = colors.waiting.background;
            this._context.clearRect(0, 0, screenWidth, screenHeight);

            this._context.font      = "30px Arial";
            this._context.fillStyle = colors.waiting.text;
            this._context.fillText("Waiting for opponent", 10, 50);
            return;
        }

        this._canvas.style.backgroundColor = colors.running.background;
        this._context.clearRect(0, 0, screenWidth, screenHeight);

        this._context.fillStyle = colors.running.player;
        this._current_player?.display(this._context);
        this._opponent?.display(this._context);

        this._ball.display(this._context);
    }

    public displayTimer(timer: number): void {
        this._canvas.style.backgroundColor = colors.running.background;
        this._context.clearRect(0, 0, screenWidth, screenHeight);

        this._context.fillStyle = colors.running.player;
        this._context.font      = "30px Arial";
        this._context.fillText(String(5 - timer), screenWidth / 2, screenHeight / 2);
    }

    /**
     * Stop the game
     */
    public stop(): void {
        this._current_player?.stop();
        GAMECONTAINER.removeChild(this._canvas);
        GameSocket.get().removeGame();
    }

    /**
     * Update the game data and display it.
     * @param response
     * @private
     */
    private update(response: update_game_response): void {
        if (!this._current_player) {
            this._current_player = new CurrentPlayer("a name", new Position(0, 0));
            this._opponent       = new Player("another name", new Position(0, 0));
        }

        if (response.data.status === "finished") {
            this.stop();
        }
        this._current_player?.setPositionFromArray(response.data.current_player.position);
        this._opponent?.setPositionFromArray(response.data.opponent.position);
        this._current_player?.setScore(response.data.current_player.score);
        this._opponent?.setScore(response.data.opponent.score);
        this._ball.position = new Position(response.data.ball[0], response.data.ball[1]);
        this._running       = response.data.status === "running";

        //now redisplay the game
        let timer: number | undefined = response.data.timer;

        if (typeof timer === "undefined")
            this.display(response.data.status === "running");
        else
            this.displayTimer(timer);
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

    private get running(): boolean {
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