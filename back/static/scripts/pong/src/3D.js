import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
// import { Pong } from "./Pong.js";
		
class ThreeD
{
	constructor(canvas, px, py, ox, oy, bx, by) {
		this._renderer = undefined;
		this._camera = undefined;
		this._scene = undefined;
		this._dLight = undefined;
		this._aLight = undefined;
		this._player = undefined;
		this._opponent = undefined;
		this._ball = undefined;
		this._ball2 = undefined;


		this.initThreejs(canvas, px, py, ox, oy, bx, by)
	}

	initThreejs(canvas, px, py, ox, oy, bx, by) {
		//Create the renderer
	
		//Create the renderer
		this._renderer = new THREE.WebGLRenderer({antialias: true, canvas});
	
		//Create the Camera
		const fov = 100; //field of view
		const aspect = 2;
		const near = 0.1; //where the render start
		const far = 3050; //where the render stop
		this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		this._camera.position.set(0, 0, 1800); //position of the camera on the z axis
		/* camera.position.z = 3; //position of the camera on the z axis*/
		//camera.position.x = -4; 

		/* const controls = new OrbitControls(this._camera, canvas);
		controls.target.position.set(0, 5, 0);
		controls.update(); */

		// class MinMaxGUIHelper {
		// 	constructor(obj, minProp, maxProp, minDif) {
		// 		this.obj = obj;
		// 		this.minProp = minProp;
		// 		this.maxProp = maxProp;
		// 		this.minDif = minDif;
		// 	}
		// 	get min() {
		// 		return this.obj[this.minProp];
		// 	}
		// 	set min(v) {
		// 		this.obj[this.minProp] = v;
		// 		this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
		// 	}
		// 	get max() {
		// 		return this.obj[this.maxProp];
		// 	}
		// 	set max(v) {
		// 		this.obj[this.maxProp] = v;
		// 		this.min = this.min;  // this will call the min setter
		// 	}
		// }

		
		// const gui = new GUI();
		// gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
		// const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
		// gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
		// gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
	
		//Create the Scene
		this._scene = new THREE.Scene();
	
		//Create the paddle element to display in scene
		const paddleWidth = 30;
		const paddleHeight = 15;
		const paddleDepth = 15;
		const paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);
	
		//Create the ball element
		const radius = 15;
		const widthSegments = 30;
		const heightSegments = 30;
		const ballGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
		
		//had light
		const color = 0xFFFFFF;
		const intensity = 3;
		this._dLight = new THREE.DirectionalLight(color, intensity);
		this._dLight.position.set(0, 0, 100);

		this._aLight = new THREE.AmbientLight(color, 1);
	
		//Create a material for the element
		const material = new THREE.MeshPhongMaterial({color: 0x44aa88});
	
		//Create a mesh : element + material
		this._player = new THREE.Mesh(paddleGeometry, material);
		this._opponent = new THREE.Mesh(paddleGeometry, material);
		this._ball = new THREE.Mesh(ballGeometry, material);
		this._ball2 = new THREE.Mesh(ballGeometry, material)
		// this._ball2.position.set(0, 0, 0)
	
		this._player.position.set(px, py, 0)
		this._opponent.position.set(ox, oy, 0)
		this._ball.position.set(bx, by, 0)

		
		this._scene.add(this._player, this._opponent, this._ball/* , this._ball2 */, this._dLight, this._aLight);
	
	}
	
	render(px, py, ox, oy, bx, by) {
		/* this._player.position.set(px, py, 0)
		this._opponent.position.set(ox, oy, 0)
		this._ball.position.set(bx, by, 0) */

		console.log(this._player.position)
		console.log(this._opponent.position)
		console.log(this._ball.position)
		// this._player.position.x = px;
		// this._player.position.y = py;
		// this._opponent.position.x = ox;
		// this._opponent.position.y = oy;
		// this._ball.position.x = bx;
		// this._ball.position.y = by;
		
		this._renderer.render(this._scene, this._camera);
		// requestAnimationFrame(render);
	}

	// _renderer;
	// _camera;
	// _scene;
	// _dLight;
	// _aLight;
	// _player;
	// _opponent;
	// _ball;
};

export {ThreeD}