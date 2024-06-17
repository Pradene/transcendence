"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentPlayer = exports.Player = void 0;
const default_color = "#515151";
const default_height = 32;
const default_width = 8;
/**
 * Represents a player in the game.
 */
class Player {
    constructor(name, position, color = default_color) {
        this._name = name;
        this._color = color;
        this._position = position;
        this._websocket = new WebSocket("ws://localhost/ws/game:8080");
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
        this._websocket.close();
    }
    _name;
    _color;
    _position;
    _websocket;
}
exports.Player = Player;
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
exports.CurrentPlayer = CurrentPlayer;
exports.default = { Player, CurrentPlayer };