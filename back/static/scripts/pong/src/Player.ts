import {Position}              from "./Utils";
import {GameSocket}            from "./GameSocket";
import {update_player_request} from "./Api";

const default_color: string  = "#515151";
const default_height: number = 32;
const default_width: number  = 8;

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

    constructor(name: string, position: Position, color: string = default_color) {
        this._name     = name;
        this._color    = color;
        this._position = position;
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
        canvas.fillStyle = this._color;
        canvas.fillRect(this._position.x,
                        this._position.y,
                        default_width,
                        default_height);
    }

    public stop(): void {
    }

    public update(): void {

    }

    private _name: string;
    private _color: string;
    private _position: Position;
}

/**
 * Represents the current player in the game.
 */
class CurrentPlayer extends Player {
    constructor(name: string, position: Position, color: string = default_color) {
        super(name, position, color);
        this._movement = "NONE";
        window.addEventListener("keypress", this._keyDownHandler);
        window.addEventListener("keyup", this._keyUpHandler);
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
    private _update(): void {
        let gs: GameSocket                 = GameSocket.get();
        let request: update_player_request = {
            method: "update_player",
            data:   {
                // @ts-ignore
                movement: this._movement
            }
        }

        gs.send(request);
    }

    private set movement(value: string) {
        if (this._movement === value)
            return;
        this._movement = value;
        this._update();
    }

    stop(): void {
        super.stop();
        clearInterval(this._intervalid);
        window.removeEventListener("keypress", this._keyDownHandler);
        window.removeEventListener("keyup", this._keyUpHandler);
    }

    private _intervalid: any;
    private _movement: string;
}

export default {Player, CurrentPlayer};
export {Player, CurrentPlayer};
