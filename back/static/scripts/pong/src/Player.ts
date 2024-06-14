import {Position} from "./Utils";

const default_color: string  = "#515151";
const default_height: number = 32;
const default_width: number  = 8;

class Player {
    constructor(name: string, position: Position, color: string = default_color) {
        this._name     = name;
        this._color    = color;
        this._position = position;
    }

    display(canvas: CanvasRenderingContext2D): void {
        canvas.fillStyle = this._color;
        canvas.fillRect(this._position.x,
                        this._position.y,
                        default_width,
                        default_height);
    }

    private _name: string;
    private _color: string;
    private _position: Position;
}

class CurrentPlayer extends Player {
    private _intervalid: any;

    constructor(name: string, position: Position, color: string = default_color) {
        super(name, position, color);
        this._intervalid = setInterval(() => {
        }, 1000);
    }
}

export default {Player, CurrentPlayer};
export {Player, CurrentPlayer};