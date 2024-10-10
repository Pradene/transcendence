import * as THREE from 'three'
import {CSS2DRenderer, CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer.js'

import { Player } from "./Player.js"
import { Ball } from "./Ball.js"
import { ThreeCamera } from './Camera.js'
import { ThreeRenderer } from './Renderer.js'
import { Sizes } from './Sizes.js'
import { Environment } from './Environment.js'
import { Timer } from './Timer.js'
import { Platform } from './Platform.js'

export class Pong {
    constructor(canvas) {

        if (Pong.instance) {
            return Pong.instance
        }

        Pong.instance = this

        canvas.getContext('webgl2')
        this.canvas = canvas
        this.sizes = new Sizes()
        this.scene = new THREE.Scene()
        this.camera = new ThreeCamera()
        this.renderer = new ThreeRenderer()
        this.environment = new Environment()
        this.timer = new Timer()
        this.platform = new Platform()

        this.player = new Player()
        this.opponent = new Player()

        this.ball = new Ball()

        this.sizes.on('resize', () => this.resize())

        window.addEventListener('beforeunload', () => Pong.instance = null)
    
        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'p':
                    this.camera.setPosition(new THREE.Vector3(0, 4, 10))
                    break
                case 'o':
                    this.camera.setPosition(new THREE.Vector3(0, 4, -10))
                    break
                case 'u':
                    this.camera.setPosition(new THREE.Vector3(0, 10, 0))
                    break
                default:
                    break
            }
        })
    }

    static get() {
        return Pong.instance || new Pong()
    }

    end() {
        Pong.instance = null
    }

    resize() {
        this.camera.resize()
        this.renderer.resize()
    }

    update(data) {
        if (data && data.status === 'waiting') {
            this.timer.create(data.timer)

        } else if (data && data.status === 'ready') {
            this.timer.remove()
            this.platform.create()
            this.player.create(data.player.position.x, data.player.position.y)
            this.opponent.create(data.opponent.position.x, data.opponent.position.y)
            this.ball.create(data.ball.position.x, data.ball.position.y)
            
        } else if (data && data.status === 'started') {
            this.player.setPosition(data.player.position.x, data.player.position.y)
            this.opponent.setPosition(data.opponent.position.x, data.opponent.position.y)
            this.ball.setPosition(data.ball.position.x, data.ball.position.y)
        }

        this.renderer.update()
    }

    /**
     * Display the game
     */
    display() {}

	displayScore()
	{
		this._scoreCtx.clearRect(0, 0, this._scoreCanvas.width, this._scoreCanvas.height)
            
        // Set styles for the score
		this._scoreCtx.ba
        this._scoreCtx.fillStyle = 'black'
		this._scoreCtx.fillRect(0, 0, this._scoreCanvas.width, this._scoreCanvas.height)
        this._scoreCtx.fillStyle = 'white'
        this._scoreCtx.font = '15px Arial'
            
        // Draw the score in the upper left corner
        this._scoreCtx.fillText(`${this._player._name}: ${this._player._score}`, 10, 30)
        this._scoreCtx.fillText(`${this._opponent._name}: ${this._opponent._score}`, 10, 50)
	}
}
