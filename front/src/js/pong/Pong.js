import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'

import { CurrentPlayer, Player } from "./Player.js"
import { Ball } from "./Ball.js"
import { Position } from "./Utils.js"
import { GameSocket } from "./GameSocket.js"
import { CANVAS_HEIGHT, CANVAS_WIDTH, THREE_RATIO } from "./Defines.js"

let font = null
const loader = new FontLoader()
loader.load("/src/fonts/Epilogue_Bold.json", (f) => font = f)

export class Pong {
    constructor(canvas) {
        this._player = undefined
        this._opponent = undefined
        this._ball = undefined
        this._timerMesh = undefined
        
        //set the canvas properties
        this._context = canvas.getContext("webgl2")
        this._canvas = canvas
        this._canvas.classList.add("active")

        this._renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this._canvas })
        this._renderer.setPixelRatio(window.devicePixelRatio)

        this._scene = new THREE.Scene()
        
        const fov = 60
        const near = 0.1
        const far = 100
        const aspect = window.screen.width / window.screen.height
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this._camera.position.set(0, 4, 10)
        this._camera.lookAt(0, 0, 0)

        this._ambientLight = new THREE.AmbientLight(0xffff00, 1)
        this._scene.add(this._ambientLight)
        
        this._running = false
    }

    /**
     * Display the game
     */
    display() {
        this._player?.display(this._scene)
        this._opponent?.display(this._scene)
        this._ball.display(this._scene)
    }

    /**
     * Display timer before game start
     * @param {*} timer 
     */
    displayTimer(timer) {
        const material = new THREE.MeshBasicMaterial({color: 0xDAFFFF})
        
        this.removeTimer()
        
        // Create geometry
        const geometry = new TextGeometry(timer, {
            font: font,
            size: 1,
            height: 0.2,
            depth: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.05,
            bevelOffset: 0,
            bevelSegments: 5
        })

        // Center the geometry
        geometry.computeBoundingBox()
        const boundingBox = geometry.boundingBox
        const center = new THREE.Vector3()
        boundingBox.getCenter(center)
        geometry.translate(-center.x, center.y, -center.z)
        
        this._timerMesh = new THREE.Mesh(geometry, material)
        
        this._scene.add(this._timerMesh)
    }

    /**
     * Remove timer from the canvas
     */
    removeTimer() {
        if (this._timerMesh) {
            this._scene.remove(this._timerMesh)
            this._timerMesh.geometry.dispose()
            this._timerMesh.material.dispose()
            this._timerMesh = null
        }
    }

    /**
     * Stop the game
     */
    async stop() {
        const gs = await GameSocket.get()
        gs.removeGame()

        this._player?.stop()

        this._renderer.dispose()
        this._scene = null

        this._canvas.classList.remove("active")
    }

    createGame() {
        this._player = new CurrentPlayer("a name", new Position(0, 0))
        this._opponent = new Player("another name", new Position(0, 0))
        this._ball = new Ball(new Position(0, 0))
        
        const width = CANVAS_HEIGHT / THREE_RATIO
        const height = 0.2
        const depth = CANVAS_WIDTH / THREE_RATIO
        
        const geometry = new THREE.BoxGeometry(width, height, depth)
        geometry.translate(0, -0.2, 0)
        const material = new THREE.MeshBasicMaterial({color: 0x00ff00})

        this._platform = new THREE.Mesh(geometry, material)
        this._scene.add(this._platform)
    }

    /**
     * Update the game data and display it.
     * @param response
     */
    update(response) {
        // Initialize player 
        if (!this._player) {
            this.createGame()
        }

        if (response.data.status === "finished") {
            this.stop()
        }
        
        this._player?.setPositionFromArray(response.data.current_player.position)
        this._opponent?.setPositionFromArray(response.data.opponent.position)
        this._player?.setScore(response.data.current_player.score)
        this._opponent?.setScore(response.data.opponent.score)
        this._ball?.setPositionFromArray(response.data.ball)

        this._running = response.data.status === "running"
        const timer = response.data.timer
        
        // now redisplay the game
        if (typeof timer === "undefined" && this._running) {
            this.removeTimer()
            this.display()

        } else if (timer) {
            this.displayTimer(timer.toString())
        }

        this._renderer.render(this._scene, this._camera)
    }

    get canvas() {
        return this._canvas
    }

    get running() {
        return this._running
    }

    set running(status) {
        if (!this.running && status) {
            this._running = true
        
        } else if (this.running && !status) {
            this.stop().then(() => {
                this._running = false
            })
        }
    }
}
