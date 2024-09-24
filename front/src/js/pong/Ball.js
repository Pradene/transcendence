import * as THREE from "three"
import { BALL_RADIUS, CANVAS_WIDTH, CANVAS_HEIGHT, THREE_RATIO } from "./Defines.js"

class Ball {
    constructor(position) {
        this._position = position

        const material = new THREE.MeshBasicMaterial({color: 0xff0000})
        
        const radius = BALL_RADIUS / THREE_RATIO
        const geometry = new THREE.SphereGeometry(radius, 6, 6)
        
        geometry.computeBoundingBox()
        const boundingBox = geometry.boundingBox

        const width = boundingBox.max.x - boundingBox.min.x
        const height = boundingBox.max.y - boundingBox.min.y
        const depth = boundingBox.max.z - boundingBox.min.z
        
        this._xOffset = -width / 2
        this._yOffset = height / 2
        this._zOffset = -depth / 2

        this._ball = new THREE.Mesh(geometry, material)
    }

    get position() {
        return this._position
    }

    set position(value) {
        this._position = value
    }

    setPositionFromArray(arr) {
        const x = ((arr[0]) - CANVAS_WIDTH / 2) / THREE_RATIO + this._xOffset
        const y = ((arr[1]) - CANVAS_HEIGHT / 2) / THREE_RATIO + this._yOffset
        const z = (0) + this._zOffset
        
        this._ball.position.set(x, y, z)
    }

    display(scene) {
        scene.add(this._ball)
    }
}

export { Ball }
