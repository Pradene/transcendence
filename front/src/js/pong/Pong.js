import * as THREE from 'three'
import {CSS2DRenderer, CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer.js'
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
		console.log(canvas)
        this._player = undefined
        this._opponent = undefined
        this._ball = undefined
        this._timerMesh = undefined
        this._psScoreMesh = undefined
        this._osScoreMesh = undefined


        
        //set the canvas properties
        this._context = canvas.getContext("webgl2")
        this._canvas = canvas
        this._canvas.classList.add("active")
        this._canvas.width = window.screen.width
        this._canvas.height = window.screen.height

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

		this._dLight = new THREE.DirectionalLight(0xFFFFFF, 3);
        this._dLight.position.set(0, 4, 6);
		this._sLight = new THREE.DirectionalLight(0xFFFFFF, 1.1);
        this._sLight.position.set(3, -2, -3);
        this._aLight = new THREE.AmbientLight(0xFFFFFF, 0.6);
        this._scene.add(this._aLight, this._dLight, this._sLight)
        
        this._running = false

		window.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'p':
                    this._camera.position.set(0, 4, 10);
                    this._camera.lookAt(0, 0, 0);
                    this._camera.up.set(0, 1, 0);
                    break;
                case 'o':
                    this._camera.position.set(0, 4, -10);
                    this._camera.lookAt(0, 0, 0);
                    this._camera.up.set(0, 1, 0);
                    break;
                case 'u':
                    this._camera.position.set(0, 10, 0);
                    this._camera.lookAt(0, 0, 0);
                    break;
                default:
                    break;
            }
        });
    }

    /**
     * Display the game
     */
    display() {
        this._player?.display(this._scene)
        this._opponent?.display(this._scene)
        
        this._ball.display(this._scene)
    }

	displayScore()
	{
		
	}

    /**
     * Display timer before game start
     * @param {*} timer 
     */
    displayTimer(timer) {
        const material = new THREE.MeshPhongMaterial({color: 0xDAFFFF})
        
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
    stop() {
        document.querySelector('.game .scores').style.visibility = "hidden"

        const gs = GameSocket.getSync()
        gs.removeGame()

        this._player?.stop()
        this._renderer.dispose()

        this._scene = null

        this._canvas.classList.remove("active")
		const score = document.getElementById("score")

		score.style.visibility = 'hidden'
    }

    createGame(response) {
		const p1 = response.data.current_player.name
		const p2 = response.data.opponent.name
		this._player = new CurrentPlayer(p1, new Position(0, 0))
        this._opponent = new Player(p2, new Position(0, 0))
        this._ball = new Ball(new Position(0, 0))

		const fieldWidth = CANVAS_HEIGHT / THREE_RATIO + 0.5
        const fieldHeight = 0.2
        const fieldDepth = CANVAS_WIDTH / THREE_RATIO + 0.5
		console.log(`WIDTH : ${fieldWidth} \n DEPTH : ${fieldDepth} \n`)
        
        const width = CANVAS_HEIGHT / THREE_RATIO + 0.5
        const height = 0.2
        const depth = CANVAS_WIDTH / THREE_RATIO + 0.5
        
        const geometry = new THREE.BoxGeometry(width, height, depth)
        geometry.translate(0, -0.2, 0)
        const material = new THREE.MeshPhongMaterial({ color: 0x576066, transparent: true, opacity: 0.3 })
		const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xA3BAC3, transparent: false, opacity: 0.5 });

		const topBotWidth = 6.7;
        const topBotHeight = 0.2;
        const topBotDepth = 0.2;
        const topBotGeometry = new THREE.BoxGeometry(topBotWidth, topBotHeight, topBotDepth);
        const leftRightWidth = 0.2;
        const leftRightHeight = 0.2;
        const leftRightDepth = 8.5;
        const leftRightGeometry = new THREE.BoxGeometry(leftRightWidth, leftRightHeight, leftRightDepth);

		

		const top = new THREE.Mesh(topBotGeometry, wallMaterial);
		top.position.set(0, 0, -4.25)
        const left = new THREE.Mesh(leftRightGeometry, wallMaterial);
        const bot = new THREE.Mesh(topBotGeometry, wallMaterial);
        const right = new THREE.Mesh(leftRightGeometry, wallMaterial);

		
		bot.position.set(0, 0, 4.25)
		left.position.set(-3.25, 0, 0)
		right.position.set(3.25, 0, 0)

        this._platform = new THREE.Mesh(geometry, material)
        this._scene.add(this._platform, top, bot, left, right)
		const score = document.getElementById("score")

		score.style.visibility = 'visible'
    }

    /**
     * Update the game data and display it.
     * @param response
     */
    update(response) {
        // Initialize player

        if (!this._player) {
            this.createGame(response)
        }

        if (response.data.status === "finished") {
            console.log("Game is finished", response)
            this.stop()
            return
        }
        
        this._player?.setPositionFromArray(response.data.current_player.position)
        this._opponent?.setPositionFromArray(response.data.opponent.position)
        this._player?.setScore(response.data.current_player.score)
        this._opponent?.setScore(response.data.opponent.score)
        this._ball?.setPositionFromArray(response.data.ball)

        this._running = response.data.status === "running"
        const timer = response.data.timer

        // now redisplay the game

        if (this._scene === null) {
            console.log("Scene is null")
            return
        } else if (typeof timer === "undefined" && this._running) {
            this.removeTimer()
            this.display()
        } else if (timer) {
            this.displayTimer(timer.toString())
            this._player.name = response.data.current_player.username
            this._opponent.name = response.data.opponent.username
        }

        // console.log("rendering")
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
