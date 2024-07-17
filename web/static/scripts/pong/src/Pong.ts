import {CurrentPlayer, Player}                 from "./Player";
import {Ball}                                  from "./Ball";
import {Position}                              from "./Utils";
import {apicallresponse, update_game_response} from "./Api";
import {GameSocket}                            from "./GameSocket";
import {GAMECONTAINER}                         from "./DomElements";
import {CANVAS_HEIGHT, CANVAS_WIDTH}           from "./Defines";

const colors: any = {
    waiting: {
        background: "#000000ff",
        border:     "#ffffffff",
        text:       "#ffffffff"
    },
    running: {
        background: "#000000ff",
        text:       "#ffffffff",
        player:     "#ffffffff",
        border:     "#ffffffff"
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
        this._canvas.width                 = CANVAS_WIDTH;
        this._canvas.height                = CANVAS_HEIGHT;

        GAMECONTAINER.appendChild(this._canvas);
    }

    /**
     * Display the game
     */
    public display(status: boolean, timer?: number): void {
        if (!status) {
            this._canvas.style.backgroundColor = colors.waiting.background;
            this._context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            this._context.font      = "30px Arial";
            this._context.fillStyle = colors.waiting.text;
            this._context.fillText("Waiting for opponent", 10, 50);
            return;
        }

        this._canvas.style.backgroundColor = colors.running.background;
        this._context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        this._context.fillStyle = colors.running.player;
        this._current_player?.display(this._context);
        this._opponent?.display(this._context);

        this._ball.display(this._context);
    }

    public displayTimer(timer: number): void {
        this._canvas.style.backgroundColor = colors.running.background;
        this._context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        this._context.fillStyle = colors.running.player;
        this._context.font      = "30px Arial";
        this._context.fillText(String(5 - timer), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }

    /**
     * Stop the game
     */
    public async stop(): Promise<void> {
        let gs: GameSocket = await GameSocket.get();
        this._current_player?.stop();
        GAMECONTAINER.removeChild(this._canvas);
        gs.removeGame();
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
            this._running = true;
        } else if (this.running && !status) {
            this.stop().then(() => {
                this._running = false;
            });
        }
    }

    private readonly _canvas: HTMLCanvasElement;
    private readonly _context: CanvasRenderingContext2D;
    private _current_player: CurrentPlayer | undefined;
    private _opponent: Player | undefined;
    private _ball: Ball;
    private _running: boolean;
}

export {Pong} ;