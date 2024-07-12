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
        canvas.fillRect(this._position.x, this._position.y, ball_size, ball_size);
    }
    _position;
}
export { Ball };
