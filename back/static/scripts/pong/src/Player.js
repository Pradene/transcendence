import { Position } from "./Utils";
const default_color = "#515151";
const default_height = 32;
const default_width = 8;
/**
 * Represents a player in the game.
 */
class Player {
    get position() {
        return this._position;
    }
    set position(value) {
        this._position = value;
    }
    get name() {
        return this._name;
    }
    set name(nname) {
        this._name = nname;
    }
    constructor(name, position, color = default_color) {
        this._name = name;
        this._color = color;
        this._position = position;
    }
    setPositionFromArray(arr) {
        let npos = new Position(arr[0], arr[1]);
        this.position = npos;
    }
    /**
     * Display the player on the canvas.
     * @param canvas
     */
    display(canvas) {
        canvas.fillStyle = this._color;
        canvas.fillRect(this._position.x, this._position.y, default_width, default_height);
    }
    stop() {
    }
    update() {
    }
    _name;
    _color;
    _position;
}
/**
 * Represents the current player in the game.
 */
class CurrentPlayer extends Player {
    constructor(name, position, color = default_color) {
        super(name, position, color);
        this._intervalid = setInterval(() => {
        }, 1000);
    }
    stop() {
        super.stop();
        clearInterval(this._intervalid);
    }
    _intervalid;
}
export default { Player, CurrentPlayer };
export { Player, CurrentPlayer };
