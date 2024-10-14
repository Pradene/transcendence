import * as THREE from 'three'
import { GameSocket } from "./GameSocket.js"
import { CANVAS_HEIGHT, CANVAS_WIDTH, PADDLE_HEIGHT, PADDLE_WIDTH, THREE_RATIO } from "./Defines.js"

/**
 * Represents a player in the game.
 */
export class Player {
    _name
    _position
    _score

    constructor(name, position) {
        this._name = name
        this._position = position
        this._score = 0
		this._scoreMesh = undefined;

        const material = new THREE.MeshPhongMaterial({color: 0xE54B4B})
        
        const paddleWidth = PADDLE_WIDTH / THREE_RATIO
        const paddleHeight = PADDLE_HEIGHT / THREE_RATIO
        const paddleDepth = PADDLE_HEIGHT / THREE_RATIO
        const geometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth)

        geometry.computeBoundingBox()
        const boundingBox = geometry.boundingBox

        const width = boundingBox.max.x - boundingBox.min.x
        const height = boundingBox.max.y - boundingBox.min.y
        const depth = boundingBox.max.z - boundingBox.min.z
        
        const x = width / 2
        const y = height / 2
        const z = -depth / 2

        geometry.translate(x, y, z)

        this._paddle = new THREE.Mesh(geometry, material)

        this._username_element = document.querySelector('.game .scores .opponent .username')
        this._score_element = document.querySelector('.game .scores .opponent .score')
    }

    get position() {
        return this._position
    }

    set position(value) {
        this._position = value
    }

    get name() {
        return this._name
    }

    set name(nname) {
        this._name = nname
    }

    setScore(value) {
        this._score = value
        this._score_element.textContent = this._score
    }

    getScore() {
        return this._score
    }

    /**
     * Set the position of the player from an array.
     * @param arr Array of two numbers.
     * @return void
     * */
    setPositionFromArray(arr) {
        const x = ((arr[1]) - CANVAS_HEIGHT / 2) / THREE_RATIO
        const y = (0)
        const z = -((arr[0]) - CANVAS_WIDTH / 2) / THREE_RATIO
        
        this._paddle.position.set(x, y, z)
    }

    /**
     * Display the player on the canvas.
     * @param canvas
     */
    display(scene) {
        scene.add(this._paddle)
        this._username_element.textContent = this._name
        this._score_element.textContent = this._score
    }

    stop() {}
}

/**
 * Represents the current player in the game.
 */
export class CurrentPlayer extends Player {
    _intervalid
    _movement
    _boundHandlerUp
    _boundHandlerDown
    
    constructor(name, position) {
        super(name, position)
        this._movement = "NONE"
        this._p2movement = "NONE"
        this._boundHandlerUp = this._keyUpHandler.bind(this)
        this._boundHandlerDown = this._keyDownHandler.bind(this)
        window.addEventListener("keydown", this._boundHandlerDown)
        window.addEventListener("keyup", this._boundHandlerUp)

        this._username_element = document.querySelector('.game .scores .user .username')
        this._score_element = document.querySelector('.game .scores .user .score')
    }

    _keyDownHandler(event) {
        if (event.key === "a")
            this.movement = "UP"
        else if (event.key === "d")
            this.movement = "DOWN"
        else if (event.key === "ArrowLeft")
            this.p2movement = "UP"
        else if (event.key === "ArrowRight")
            this.p2movement = "DOWN"
        console.log(event.key)
    }

    _keyUpHandler(event) {
        if (event.key === "a" || event.key === "d")
            this.movement = "NONE"
        else if(event.key === "ArrowLeft" || event.key === "ArrowRight")
            this.p2movement = "NONE"
    }

    /**
     * Update the player's movement on the server.
     * @private
     */
    async _update() {
        let gs = await GameSocket.get()
        let request = {
            method: "update_player",
            data: {
                movement: this._movement,
                p2movement: this._p2movement
            }
        }
        gs.send(request)
    }

    set movement(value) {
        if (this._movement === value)
            return

        this._movement = value
        this._update().then(r => {})
    }

    set p2movement(value) {
        if (this._p2movement === value)
            return

        this._p2movement = value
        this._update().then(r => {})

    }

    stop() {
        super.stop()
        clearInterval(this._intervalid)
        window.removeEventListener("keypress", this._keyDownHandler)
        window.removeEventListener("keyup", this._keyUpHandler)
    }
}
