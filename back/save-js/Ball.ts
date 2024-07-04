import {Position} from "./Utils";

const default_color: string = "#515151";
const ball_size: number = 4;

class Ball {
    constructor(position: Position) {
        this._position = position;
    }

    get position(): Position {
        return this._position;
    }

    set position(value: Position) {
        this._position = value;
    }

    display(canvas: CanvasRenderingContext2D): void {
        canvas.fillStyle = default_color;
        canvas.fillRect(this._position.x,
                        this._position.y,
                        ball_size,
                        ball_size);
    }

    private _position: Position;
}

export {Ball};