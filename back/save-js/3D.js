import * as THREE from 'three';
// import { Pong } from "./Pong.js";
		
class ThreeD
{
	constructor()
	{
		this._renderer = undefined;
		this._camera = undefined;
		this._scene = undefined;
		this._dLight = undefined;
		this._aLight = undefined;
		this._player = undefined;
		this._opponent = undefined;
		this._ball = undefined;
	}

	initThreejs(canvas) {
		//Create the renderer
	
		//Create the renderer
		this._renderer = new THREE.WebGLRenderer({antialias: true, canvas});
	
		//Create the Camera
		const fov = 75; //field of view
		const aspect = 2;
		const near = 0.1; //where the render start
		const far = 150; //where the render stop
		this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		this._camera.position.z = 8; //position of the camera on the z axis
		/* camera.position.z = 3; //position of the camera on the z axis*/
		//camera.position.x = -4; 

		const controls = new OrbitControls(camera, canvas);
		controls.target.set(0, 5, 0);
		controls.update();

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

		function updateCamera() {
			this._camera.updateProjectionMatrix();
		}
		
		// const gui = new GUI();
		// gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
		// const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
		// gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
		// gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
	
		//Create the Scene
		this._scene = new THREE.Scene();
	
		//Create the paddle element to display in scene
		const paddleWidth = 3;
		const paddleHeight = 1;
		const paddleDepth = 1;
		const paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);
	
		//Create the ball element
		const radius = 1;
		const widthSegments = 30;
		const heightSegments = 30;
		const ballGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
	
		//had light
		const color = 0xFFFFFF;
		const intensity = 3;
		this._dLight = new THREE.DirectionalLight(color, intensity);
		this._dLight.position.set(-1, 2, 4);

		this._aLight = new THREE.AmbientLight(color, 0.5);
	
		//Create a material for the element
		const material = new THREE.MeshPhongMaterial({color: 0x44aa88});
	
		//Create a mesh : element + material
		this._player = new THREE.Mesh(paddleGeometry, material);
		this._opponent = new THREE.Mesh(paddleGeometry, material);
		this._ball = new THREE.Mesh(ballGeometry, material);
	
		player.position.x = -6;
		opponent.position.x = 6;

		
		scene.add(this._player, this._opponent, this._ball, this._dLight, this._aLight);
	
		requestAnimationFrame(render);
	}
	
	render(px, py, ox, oy, bx, by){
		player.position.x = px;
		player.position.y = py;
		opponent.position.x = ox;
		opponent.position.y = oy;
		ball.position.x = bx;
		ball.position.y = by;

		renderer.render(scene, camera);

		// requestAnimationFrame(render);
	}

	_renderer;
	_camera;
	_scene;
	_dLight;
	_aLight;
	_player;
	_opponent;
	_ball;
};

export {ThreeD}