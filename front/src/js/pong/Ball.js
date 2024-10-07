import * as THREE from "three"
import { BALL_RADIUS, CANVAS_WIDTH, CANVAS_HEIGHT, THREE_RATIO } from "./Defines.js"

class Ball {
    constructor(position) {
        this._position = position

        const material = new THREE.MeshPhongMaterial({color: 0xE54B4B})
        
        const radius = BALL_RADIUS / THREE_RATIO
        const geometry = new THREE.SphereGeometry(radius, 30, 30)
        
        geometry.computeBoundingBox()
        const boundingBox = geometry.boundingBox

        const width = boundingBox.max.x - boundingBox.min.x
        const height = boundingBox.max.y - boundingBox.min.y
        const depth = boundingBox.max.z - boundingBox.min.z
        
        const x = -width / 2
        const y = -height / 2
        const z = depth / 2

        geometry.translate(x, y, z)

        this._ball = new THREE.Mesh(geometry, material)
    }

    get position() {
        return this._position
    }

    set position(value) {
        this._position = value
    }

    setPositionFromArray(arr) {
        const x = ((arr[1]) - CANVAS_HEIGHT / 2) / THREE_RATIO
        const y = (0)
        const z = -((arr[0]) - CANVAS_WIDTH / 2) / THREE_RATIO
        
        this._ball.position.set(x, y, z)
    }

    display(scene) {
        scene.add(this._ball)
    }
}

export { Ball }
