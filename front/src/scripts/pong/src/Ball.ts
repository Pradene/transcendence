import {Position} from "./Utils";
import {BALL_RADIUS} from "./Defines";

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
        canvas.fillRect(this._position.x,
                        this._position.y,
                        BALL_RADIUS,
                        BALL_RADIUS);
    }

    private _position: Position;
}

export {Ball};