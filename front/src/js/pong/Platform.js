import * as THREE from 'three'
import { Pong } from "./Pong.js"
import { CANVAS_HEIGHT, CANVAS_WIDTH, THREE_RATIO } from "./Defines.js"

export class Platform {
    constructor() {
        this.game = Pong.get()

        this.scene = this.game.scene
        this.instance = null
    }

    create() {
        const material = new THREE.MeshPhongMaterial({ color: 0x576066, transparent: true, opacity: 0.3 })
        
        const fieldWidth = CANVAS_HEIGHT / THREE_RATIO + 0.5
        const fieldHeight = 0.2
        const fieldDepth = CANVAS_WIDTH / THREE_RATIO + 0.5
        
        const fieldGeometry = new THREE.BoxGeometry(
            fieldWidth,
            fieldHeight,
            fieldDepth
        )

        fieldGeometry.translate(0, -0.2, 0)

        const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xA3BAC3, transparent: false, opacity: 0.5 })
        
        const topBotGeometry = new THREE.BoxGeometry(6.7, 0.2, 0.2)
        const leftRightGeometry = new THREE.BoxGeometry(0.2, 0.2, 8.5)
        
        const platform = new THREE.Mesh(fieldGeometry, material)
		const top = new THREE.Mesh(topBotGeometry, wallMaterial)
        const left = new THREE.Mesh(leftRightGeometry, wallMaterial)
        const bot = new THREE.Mesh(topBotGeometry, wallMaterial)
        const right = new THREE.Mesh(leftRightGeometry, wallMaterial)
        
		top.position.set(0, 0, -4.25)
		bot.position.set(0, 0, 4.25)
		left.position.set(-3.25, 0, 0)
		right.position.set(3.25, 0, 0)
        
        this.instance = new THREE.Group()

        this.instance.add(
            platform,
            top,
            bot,
            left,
            right
        )

        this.scene.add(this.instance)
    }
}