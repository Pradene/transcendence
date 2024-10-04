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
        this._context = canvas[0].getContext("webgl2")
        this._canvas = canvas[0]
        this._canvas.classList.add("active")
        this._canvas.width = window.screen.width
        this._canvas.height = window.screen.height

		this._scoreCtx = canvas[1].getContext('2d')
		this._scoreCanvas = canvas[1]
		this._scoreCanvas.classList.add('active')
		if (this._scoreCanvas)
			console.log("Je l'ai !")
		this._scoreCanvas.width = window.screen.width;
		this._scoreCanvas.height = window.screen.height;
		if (this._scoreCtx)
			console.log("Alleluia !!!")
		else
			console.log("yapa yapa")

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
    }

    /**
     * Display the game
     */
    display() {
		/* const controls = new OrbitControls(this._camera, this._renderer.domElement);
        controls.enableDamping = true; // Smooth the movement
        //controls.dampingFactor = 0.25;
        controls.screenSpacePanning = false; // Prevent panning in screen space
        //controls.maxPolarAngle = Math.PI / 2; // Restrict vertical rotation
        controls.minDistance = 0.5;
        controls.maxDistance = 10;
        // Adjust rotation and zoom speeds
        controls.rotateSpeed = 0.01; // Slower rotation
        controls.zoomSpeed = 0.01; // Slower zoom
        // Enable damping (inertia) for smoother control
        controls.enableDamping = true;
        controls.dampingFactor = 0.01; // Lower value for finer control
        // Adjust pan speed for the small scale
        controls.panSpeed = 0.01;
        // Prevent the camera from zooming out too much
        controls.maxZoom = 10;
        controls.minZoom = 0.5; */

        this._player?.display(this._scene)
        this._opponent?.display(this._scene)
        
        this._ball.display(this._scene)
		this.displayScore()

		window.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'p':
                    this._camera.position.set(0, 4, 10);
                    this._camera.lookAt(0, 0, 0);
                    this._camera.up.set(0, 1, 0);
                    this._renderer.render(this._scene, this._camera);
                    break;
                case 'o':
                    this._camera.position.set(0, 4, -10);
                    this._camera.lookAt(0, 0, 0);
                    this._camera.up.set(0, 1, 0);
                    this._renderer.render(this._scene, this._camera);
                    break;
                case 'u':
                    this._camera.position.set(0, 10, 0);
                    this._camera.lookAt(0, 0, 0);
                    this._renderer.render(this._scene, this._camera);
                    break;
                default:
                    break;
            }
        });
        const camMvt = () => {
            requestAnimationFrame(camMvt);
            controls.update(); // Only required if enableDamping or autoRotate are used
            this._renderer.render(this._scene, this._camera);
        };
    }

	displayScore()
	{
		this._scoreCtx.clearRect(0, 0, this._scoreCanvas.width, this._scoreCanvas.height);
            
            // Set styles for the score
		this._scoreCtx.ba
        this._scoreCtx.fillStyle = 'black';
		this._scoreCtx.fillRect(0, 0, this._scoreCanvas.width, this._scoreCanvas.height)
        this._scoreCtx.fillStyle = 'white';
        this._scoreCtx.font = '15px Arial';
            
            // Draw the score in the upper left corner
        this._scoreCtx.fillText(`${this._player._name}: ${this._player._score}`, 10, 30);
        this._scoreCtx.fillText(`${this._opponent._name}: ${this._opponent._score}`, 10, 50);
		/* const scoreDiv = document.getElementsByClassName("scoreDiv")
		const pName = this._player._name
		const oName = this._opponent._name
		const pScore = this._player._score
		const oScore = this._opponent._score
		scoreDiv.textContent = `${pName}: ${pScore}\n${oName}: ${oScore}`
		const material = new THREE.MeshPhongMaterial({color: 0xDAFFFF})
         */
        /* this.removeScore()
        
		const pn_text = this._player._name.toString()
		const on_text = this._opponent._name.toString()
		const ps_text = this._player._score.toString()
		const os_text = this._opponent._score.toString()

        // Create geometry
        const ps_geometry = new TextGeometry(ps_text, {
            font: font,
            size: 0.3,
            height: 0.1,
            depth: 0.1,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.05,
            bevelOffset: 0,
            bevelSegments: 5
        })

		const os_geometry = new TextGeometry(os_text, {
            font: font,
            size: 0.3,
            height: 0.1,
            depth: 0.1,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.05,
            bevelOffset: 0,
            bevelSegments: 5
        })

		const pn_geometry = new TextGeometry(pn_text, {
            font: font,
            size: 0.3,
            height: 0.1,
            depth: 0.05,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.05,
            bevelOffset: 0,
            bevelSegments: 5
        })

		const on_geometry = new TextGeometry(on_text, {
            font: font,
            size: 0.3,
            height: 0.1,
            depth: 0.05,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.05,
            bevelOffset: 0,
            bevelSegments: 5
        })

		const material = new THREE.MeshPhongMaterial({color: 0xE54B4B})
		geometry.computeBoundingBox()
        const boundingBox = geometry.boundingBox
        const center = new THREE.Vector3()
        boundingBox.getCenter(center)
        geometry.translate(-center.x, center.y, -center.z)
        
        this._psScoreMesh = new THREE.Mesh(ps_geometry, material)
		this._osScoreMesh = new THREE.Mesh(os_geometry, material)
		this._pnScoreMesh = new THREE.Mesh(pn_geometry, material)
		this._onScoreMesh = new THREE.Mesh(on_geometry, material)

		this._psScoreMesh.position.set(0, -0.5, 6)
		this._osScoreMesh.position.set(0, 0, -8)

		this._pnScoreMesh.position.set(0, 0, 7)
		this._onScoreMesh.position.set(0, 0, -7)
        
        this._camera.add(this._psScoreMesh, this._osScoreMesh, this._pnScoreMesh, this._onScoreMesh) */
	}

	removeScore() {
        if (this._psScoreMesh) {
            this._camera.remove(this._psScoreMesh)
            this._psScoreMesh.geometry.dispose()
            this._psScoreMesh.material.dispose()
            this._psScoreMesh = null
        }
		if (this._pnScoreMesh) {
            this._camera.remove(this._pnScoreMesh)
            this._pnScoreMesh.geometry.dispose()
            this._pnScoreMesh.material.dispose()
            this._pnScoreMesh = null
        }
		if (this._onScoreMesh) {
            this._camera.remove(this._onScoreMesh)
            this._onScoreMesh.geometry.dispose()
            this._onScoreMesh.material.dispose()
            this._onScoreMesh = null
        }
		if (this._osScoreMesh) {
            this._camera.remove(this._osScoreMesh)
            this._osScoreMesh.geometry.dispose()
            this._osScoreMesh.material.dispose()
            this._osScoreMesh = null
        }
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
    async stop() {
        document.querySelector('.game .scores').style.visibility = "hidden"

        const gs = await GameSocket.get()
        gs.removeGame()

        this._player?.stop()
        this._renderer.dispose()

        this._scene = null

        this._canvas.classList.remove("active")
    }

	createScore() {
		const label = new CSS2DRenderer()
		label.setSize(window.innerHeight, window.innerWidth)
		label.domElement.style.position = 'absolute'
		label.domElement.style.top = '0'
		label.domElement.style.color = "#FFFFFF"

		document.body.appendChild(label.domElement)

		const pName = this._player._name
		const oName = this._opponent._name
		const pScore = this._player._score
		const oScore = this._opponent._score

		const scoreDiv = document.createElement('div')
		scoreDiv.textContent = `${pName}: ${pScore}\n${oName}: ${oScore}`
		scoreDiv.style.color = "white"
		scoreDiv.style.fontSize = "15px"
		scoreDiv.style.pointerEvents = "none"
		scoreDiv.style.top = "10px"
    	scoreDiv.style.left = "10px"
		scoreDiv.className = "scoreDiv"

		const scoreLabel = new CSS2DObject(scoreDiv)
		scoreLabel.position.set(-window.innerWidth / 2 + 10, window.innerHeight / 2 - 10, 0)
		this._camera.add(scoreLabel)
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
		/* const p1 = response.data.current_player.name
		const p2 = response.data.opponent.name
		
        this._player = new CurrentPlayer(p1, new Position(0, 0))
        this._opponent = new Player(p2, new Position(0, 0))
        this._ball = new Ball(new Position(0, 0))
		//this.createScore()
        
        const fieldWidth = CANVAS_HEIGHT / THREE_RATIO
        const fieldHeight = 0.2
        const fieldDepth = CANVAS_WIDTH / THREE_RATIO
		console.log(`WIDTH : ${fieldWidth} \n DEPTH : ${fieldDepth} \n`)
        
        const geometry = new THREE.BoxGeometry(fieldWidth, fieldHeight, fieldDepth)
        const material = new THREE.MeshBasicMaterial({color: 0x00ff00})
		
		const fieldMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, transparent: true, opacity: 0.3 });
        const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xffffda, transparent: false, opacity: 0.5 });
        //Create the paddle element to display in scene
		
        const fieldGeometry = new THREE.BoxGeometry(fieldWidth, fieldHeight, fieldDepth);
        fieldGeometry.translate(0, -1, 0)
        geometry.translate(0, -1, 0)

		//fieldGeometry.position.set(0, -0.4, 0)
        const topBotWidth = 2.3;
        const topBotHeight = 0.3;
        const topBotDepth = 0.15;
        const topBotGeometry = new THREE.BoxGeometry(topBotWidth, topBotHeight, topBotDepth);
        const leftRightWidth = 0.15;
        const leftRightHeight = 0.3;
        const leftRightDepth = 2.63;
        const leftRightGeometry = new THREE.BoxGeometry(leftRightWidth, leftRightHeight, leftRightDepth);

		topBotGeometry.position.translate(0, -1, 0)
        leftRightGeometry.position.translate(0, -1, 0)

		const top = new THREE.Mesh(topBotGeometry, wallMaterial);
        const left = new THREE.Mesh(leftRightGeometry, wallMaterial);
        const bot = new THREE.Mesh(topBotGeometry, wallMaterial);
        const right = new THREE.Mesh(leftRightGeometry, wallMaterial);

        this._platform = new THREE.Mesh(fieldGeometry, material)
        this._scene.add(this._platform, bot, top, left, right) */
    }

    /**
     * Update the game data and display it.
     * @param response
     */
    update(response) {
        // Initialize player 
		//console.log(response)
        if (!this._player) {
            this.createGame(response)
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
            this._player.name = response.data.current_player.username
            this._opponent.name = response.data.opponent.username
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
