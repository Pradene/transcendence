import {Position} from "./Utils";

const default_color: string = "#515151";
const default_height: number = 32;
const default_width: number = 8;

/**
 * Represents a player in the game.
 */
class Player {
    get position(): Position {
        return this._position;
    }

    set position(value: Position) {
        this._position = value;
    }
    constructor(name: string, position: Position, color: string = default_color) {
        this._name = name;
        this._color = color;
        this._position = position;
    }

    /**
     * Display the player on the canvas.
     * @param canvas
     */
    display(canvas: CanvasRenderingContext2D): void {
        canvas.fillStyle = this._color;
        canvas.fillRect(this._position.x,
                        this._position.y,
                        default_width,
                        default_height);
    }

    stop(): void {
    }

    update(): void {

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
        this._intervalid = setInterval(() => {
        }, 1000);
    }

    stop(): void {
        super.stop();
        clearInterval(this._intervalid);
    }

    private _intervalid: any;
}

export default {Player, CurrentPlayer};
export {Player, CurrentPlayer};