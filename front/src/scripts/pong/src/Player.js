import { Position } from "./Utils";
import { GameSocket } from "./GameSocket";
import { PADDLE_HEIGHT, PADDLE_WIDTH } from "./Defines";
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
    constructor(name, position) {
        this._name = name;
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
        canvas.fillRect(this._position.x, this._position.y, PADDLE_WIDTH, PADDLE_HEIGHT);
        canvas.font = "20px Arial";
        canvas.fillText(String(this._score), this._position.x, 20);
    }
    stop() {
    }
    _name;
    _position;
    _score;
}
/**
 * Represents the current player in the game.
 */
class CurrentPlayer extends Player {
    constructor(name, position) {
        super(name, position);
        this._movement = "NONE";
        this._boundHandlerUp = this._keyUpHandler.bind(this);
        this._boundHandlerDown = this._keyDownHandler.bind(this);
        this._boundTouchStart = this._touchStartHandler.bind(this);
        this._boundTouchEnd = this._touchEndHandler.bind(this);

        let canvas = document.getElementById('game-canvas');
        canvas.addEventListener("touchstart", this._boundTouchStart);
        canvas.addEventListener("touchend", this._boundTouchEnd);

        window.addEventListener("keypress", this._boundHandlerDown);
        window.addEventListener("keyup", this._boundHandlerUp);
/*
        document.addEventListener("touchstart", this._boundTouchStart);
        document.addEventListener("touchend", this._boundTouchEnd); */
    }
    _keyDownHandler(event) {
        if (event.key === "w")
            this.movement = "UP";
        else if (event.key === "s")
            this.movement = "DOWN";
    }
    _keyUpHandler(event) {
        this.movement = "NONE";
    }

    _touchStartHandler(event) {
        event.preventDefault();
        this._touchStartY = event.changedTouches[0].screenY;
        console.log("touchStart at ", this.touchStartY)
    }

    _touchEndHandler(event) {
        event.preventDefault();
        let touchEndY = event.changedTouches[0].screenY;
        console.log("touchEnd at ", _touchEndY)
        if (this._touchStartY > touchEndY) {
            this.movement = "UP";
        } else if (this._touchStartY < touchEndY) {
            this.movement = "DOWN";
        }
    }
    /**
     * Update the player's movement on the server.
     * @private
     */
    async _update() {
        let gs = await GameSocket.get();
        let request = {
            method: "update_player",
            data: {
                movement: this._movement
            }
        };
        gs.send(request);
    }
    set movement(value) {
        if (this._movement === value)
            return;
        this._movement = value;
        this._update().then(r => {
        });
    }
    stop() {
        super.stop();
        clearInterval(this._intervalid);
        window.removeEventListener("keypress", this._keyDownHandler);
        window.removeEventListener("keyup", this._keyUpHandler);

        document.removeEventListener("touchstart", this._boundTouchStart);
        document.removeEventListener("touchend", this._boundTouchEnd);
    }
    _intervalid;
    _movement;
    _boundHandlerUp;
    _boundHandlerDown;
}
export { Player, CurrentPlayer };
