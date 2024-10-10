import * as THREE from "three"
import { BALL_RADIUS, THREE_RATIO } from "./Defines.js"
import { Pong } from "./Pong.js"

export class Ball {
    constructor() {
        
        this.game = Pong.get()

        this.scene = this.game.scene
    }

    create(x, y) {
        const material = new THREE.MeshPhongMaterial({color: 0xE54B4B})
        
        const radius = BALL_RADIUS / THREE_RATIO
        const geometry = new THREE.SphereGeometry(radius, 30, 30)

        this.instance = new THREE.Mesh(geometry, material)

        this.setPosition(x, y)

        this.scene.add(this.instance)
    }

    setPosition(x, y) {
        const vec = new THREE.Vector3(0, 0, 0)
        vec.x = y / THREE_RATIO
        vec.y = 0
        vec.z = x / THREE_RATIO
        
        this.instance.position.copy(vec)
    }
}
