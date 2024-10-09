import * as THREE from 'three'
import { PADDLE_HEIGHT, PADDLE_WIDTH, THREE_RATIO } from "./Defines.js"
import { Pong } from './Pong.js'


export class Player {
    constructor() {

        this.game = Pong.get()

        this.scene = this.game.scene
    }

    create(x, y) {
        const material = new THREE.MeshPhongMaterial({color: 0xE54B4B})
        
        const paddleWidth = PADDLE_WIDTH / THREE_RATIO
        const paddleHeight = PADDLE_HEIGHT / THREE_RATIO
        const paddleDepth = PADDLE_HEIGHT / THREE_RATIO
        const geometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth)

        this.instance = new THREE.Mesh(geometry, material)

        this.setPosition(x, y)

        this.scene.add(this.instance)
    }

    setPosition(x, y) {
        const vec = new THREE.Vector3(0, 0, 0)
        vec.x = y / THREE_RATIO
        vec.y = 0
        vec.z = x / THREE_RATIO
        
        this.instance.position.set(vec.x, vec.y, vec.z)
    }
}
