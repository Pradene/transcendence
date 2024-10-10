import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { Pong } from './Pong'

export class Timer {
    constructor() {

        this.game = Pong.get()

        this.scene = this.game.scene

        this.font = null
        this.loadFont()

        this.instance = null
    }

    loadFont () {
        const loader = new FontLoader()
        loader.load("/src/fonts/Epilogue_Bold.json",
            (f) => {
                this.font = f
            }
        )
    }

    create(time) {
        this.remove()

        const material = new THREE.MeshPhongMaterial({color: 0xDAFFFF})
        
        
        // Create geometry
        const geometry = new TextGeometry(time.toString(), {
            font: this.font,
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
        
        this.instance = new THREE.Mesh(geometry, material)
        
        this.scene.add(this.instance)
    }

    remove() {
        if (this.instance) {
            this.scene.remove(this.instance)
            this.instance.geometry.dispose()
            this.instance.material.dispose()
            this.instance = null
        }
    }
}