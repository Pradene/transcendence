import { BALL_RADIUS } from "./Defines";
class Ball {
    constructor(position) {
        this._position = position;
    }
    get position() {
        return this._position;
    }
    set position(value) {
        this._position = value;
    }
    display(canvas) {
        canvas.fillRect(this._position.x, this._position.y, BALL_RADIUS, BALL_RADIUS);
    }
    _position;
}
export { Ball };
