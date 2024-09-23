import { BALL_RADIUS } from "./Defines.js";

class Ball {
    _position;

    constructor(position) {
        this._position = position;
    }

    get position() {
        return this._position;
    }

    set position(value) {
        this._position = value;
    }

    setPositionFromArray(arr) {
        this.position = new Position(arr[0], arr[1]);
    }

    display(canvas) {
        canvas.fillRect(this._position.x, this._position.y, BALL_RADIUS, BALL_RADIUS);
    }
}
export { Ball };
