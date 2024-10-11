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

        this.endGame = () => this.end()
        window.addEventListener('beforeunload', this.endGame)
    
        this.inputHandler = (e) => this.changeCameraPosition(e)
        window.addEventListener('keydown', this.inputHandler)

        this.requestId = null
        this.display()
    }

    static get() {
        return Pong.instance || new Pong()
    }

    changeCameraPosition(e) {
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
    }

    end() {
        Pong.instance = null

        if (this.requestId) {
            window.cancelAnimationFrame(this.requestId)
            this.requestId = null
        }
    }

    resize() {
        this.camera.resize()
        this.renderer.resize()
    }

    update(data) {
        if (data.type === 'player_info') {
            this.displayPlayersName(data)

        } else if (data && data.status === 'waiting') {
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
            this.displayScore(data)
        }
    }
    
    display() {
        this.renderer.update()
        this.requestId = window.requestAnimationFrame(this.display.bind(this))
    }

    displayScore(data) {
        const playerScore = data.player.score
        const opponentScore = data.opponent.score

        const playerScoreElement = document.querySelector('.scores .player .score')
        playerScoreElement.textContent = playerScore
        
        const opponentScoreElement = document.querySelector('.scores .opponent .score')
        opponentScoreElement.textContent = opponentScore
    }

    displayPlayersName(data) {
        const player = data.player
        const opponent = data.opponent

        const playerName = document.querySelector('.scores .player .username')
        playerName.textContent = player

        const opponentName = document.querySelector('.scores .opponent .username')
        opponentName.textContent = opponent
    }
}
