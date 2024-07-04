import { Position } from "./Utils.js";
import { GameSocket } from "./GameSocket.js";
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
    setScore(value) {
        this._score = value;
    }
    constructor(name, position, color = default_color) {
        this._name = name;
        this._color = color;
        this._position = position;
        this._score = 0;
    }
    /**
     * Set the position of the player from an array.
     * @param arr Array of two numbers.
     * @return void
     * */
    setPositionFromArray(arr) {
        this.position = new Position(arr[0], arr[1]);
    }
    /**
     * Display the player on the canvas.
     * @param canvas
     */
    display(canvas) {
        canvas.fillStyle = this._color;
        canvas.fillRect(this._position.x, this._position.y, default_width, default_height);
        canvas.font = "20px Arial";
        canvas.fillText(String(this._score), this._position.x, 20);
    }
    stop() {
    }
    update() {
    }
    _name;
    _color;
    _position;
    _score;
}
/**
 * Represents the current player in the game.
 */
class CurrentPlayer extends Player {
    constructor(name, position, color = default_color) {
        super(name, position, color);
        this._movement = "NONE";
        this._boundHandlerUp = this._keyUpHandler.bind(this);
        this._boundHandlerDown = this._keyDownHandler.bind(this);
        window.addEventListener("keypress", this._boundHandlerDown);
        window.addEventListener("keyup", this._boundHandlerUp);
    }
    _keyDownHandler(event) {
        ;
        if (event.key === "w")
            this.movement = "UP";
        else if (event.key === "s")
            this.movement = "DOWN";
    }
    _keyUpHandler(event) {
        this.movement = "NONE";
    }
    /**
     * Update the player's movement on the server.
     * @private
     */
    _update() {
        let gs = GameSocket.get();
        let request = {
            method: "update_player",
            data: {
                // @ts-ignore
                movement: this._movement
            }
        };
        gs.send(request);
    }
    set movement(value) {
        if (this._movement === value)
            return;
        this._movement = value;
        this._update();
    }
    stop() {
        super.stop();
        clearInterval(this._intervalid);
        window.removeEventListener("keypress", this._keyDownHandler);
        window.removeEventListener("keyup", this._keyUpHandler);
    }
    _intervalid;
    _movement;
    _boundHandlerUp;
    _boundHandlerDown;
}
export default { Player, CurrentPlayer };
export { Player, CurrentPlayer };
