"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ball = void 0;
const default_color = "#515151";
const ball_size = 4;
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
        canvas.fillStyle = default_color;
        canvas.fillRect(this._position.x, this._position.y, ball_size, ball_size);
    }
    _position;
}
exports.Ball = Ball;
