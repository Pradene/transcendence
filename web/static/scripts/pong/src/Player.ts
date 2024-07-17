import {Position}                    from "./Utils";
import {GameSocket}                  from "./GameSocket";
import {update_player_request}       from "./Api";
import {PADDLE_HEIGHT, PADDLE_WIDTH} from "./Defines";

/**
 * Represents a player in the game.
 */
class Player {
    public get position(): Position {
        return this._position;
    }

    public set position(value: Position) {
        this._position = value;
    }


    public get name(): string {
        return this._name;
    }

    public set name(nname: string) {
        this._name = nname;
    }

    public setScore(value: number): void {
        this._score = value;
    }

    constructor(name: string, position: Position) {
        this._name     = name;
        this._position = position;
        this._score    = 0;
    }

    /**
     * Set the position of the player from an array.
     * @param arr Array of two numbers.
     * @return void
     * */
    public setPositionFromArray(arr: Array<number>) {
        this.position = new Position(arr[0], arr[1]);
    }

    /**
     * Display the player on the canvas.
     * @param canvas
     */
    public display(canvas: CanvasRenderingContext2D): void {
        canvas.fillRect(this._position.x,
                        this._position.y,
                        PADDLE_WIDTH,
                        PADDLE_HEIGHT);
        canvas.font = "20px Arial";
        canvas.fillText(String(this._score), this._position.x, 20);
    }

    public stop(): void {
    }

    private _name: string;
    private _position: Position;
    private _score: number;
}

/**
 * Represents the current player in the game.
 */
class CurrentPlayer extends Player {
    constructor(name: string, position: Position) {
        super(name, position);
        this._movement         = "NONE";
        this._boundHandlerUp   = this._keyUpHandler.bind(this);
        this._boundHandlerDown = this._keyDownHandler.bind(this);
        window.addEventListener("keypress", this._boundHandlerDown);
        window.addEventListener("keyup", this._boundHandlerUp);
    }

    private _keyDownHandler(event: KeyboardEvent): void {
        if (event.key === "w")
            this.movement = "UP";
        else if (event.key === "s")
            this.movement = "DOWN";
    }

    private _keyUpHandler(event: KeyboardEvent): void {
        this.movement = "NONE";
    }

    /**
     * Update the player's movement on the server.
     * @private
     */
    private async _update(): Promise<void> {
        let gs: GameSocket                 = await GameSocket.get();
        let request: update_player_request = {
            method: "update_player",
            data:   {
                movement: this._movement
            }
        }

        gs.send(request);
    }

    private set movement(value: string) {
        if (this._movement === value)
            return;
        this._movement = value;
        this._update().then(r => {
        });
    }

    stop(): void {
        super.stop();
        clearInterval(this._intervalid);
        window.removeEventListener("keypress", this._keyDownHandler);
        window.removeEventListener("keyup", this._keyUpHandler);
    }

    private _intervalid: any;
    private _movement: string;
    private _boundHandlerUp: (arg0: KeyboardEvent) => void;
    private _boundHandlerDown: (arg0: KeyboardEvent) => void;
}

export {Player, CurrentPlayer};
