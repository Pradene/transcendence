import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
class ThreeD {
    constructor(renderer, scene, camera, px, py, ox, oy, bx, by) {
        //Create the renderer
        this._renderer = renderer;
        // this._renderer = new THREE.WebGLRenderer({antialias: true, canvas});
        //Create the Camera
        /* const fov = 100; //field of view
        const aspect = 2;
        const near = 0.1; //where the render start
        const far = 3050; //where the render stop */
        // this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera = camera;
        /* camera.position.z = 3; //position of the camera on the z axis*/
        //camera.position.x = -4;
        /* const controls = new OrbitControls(this._camera, this._renderer.domElement);

        controls.enableDamping = true; // Smooth the movement
        controls.dampingFactor = 0.25;
        controls.screenSpacePanning = false; // Prevent panning in screen space
        controls.maxPolarAngle = Math.PI / 2; // Restrict vertical rotation */
        /* controls.target.position.set(0, 5, 0);
        controls.update();

        class MinMaxGUIHelper {
            constructor(obj, minProp, maxProp, minDif) {
                this.obj = obj;
                this.minProp = minProp;
                this.maxProp = maxProp;
                this.minDif = minDif;
            }
            get min() {
                return this.obj[this.minProp];
            }
            set min(v) {
                this.obj[this.minProp] = v;
                this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
            }
            get max() {
                return this.obj[this.maxProp];
            }
            set max(v) {
                this.obj[this.maxProp] = v;
                this.min = this.min;  // this will call the min setter
            }
        } */
        // const gui = new GUI();
        // gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
        // const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
        // gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
        // gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
        //Create the Scene
        this._scene = scene;
        // this._scene = new THREE.Scene();
        //Create the paddle element to display in scene
        const paddleWidth = 64 / 600 * 2;
        const paddleHeight = 0.1;
        const paddleDepth = 0.1;
        const paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);
        //Create the ball element
        const radius = 0.05;
        const widthSegments = 30;
        const heightSegments = 30;
        const ballGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
        //had light
        const color = 0xFFFFFF;
        const intensity = 3;
        this._dLight = new THREE.DirectionalLight(color, intensity);
        this._dLight.position.set(0, 0, 5);
        this._aLight = new THREE.AmbientLight(color, 1);
        //Create a material for the element
        const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 });
        const fieldMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
        const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xffffda, transparent: false, opacity: 0.5 });
        //Create the paddle element to display in scene
        const fieldWidth = 2;
        const fieldHeight = 0.1;
        const fieldDepth = 2.66;
        const fieldGeometry = new THREE.BoxGeometry(fieldWidth, fieldHeight, fieldDepth);
        const topBotWidth = 2.3;
        const topBotHeight = 0.3;
        const topBotDepth = 0.15;
        const topBotGeometry = new THREE.BoxGeometry(topBotWidth, topBotHeight, topBotDepth);
        const leftRightWidth = 0.15;
        const leftRightHeight = 0.3;
        const leftRightDepth = 2.63;
        const leftRightGeometry = new THREE.BoxGeometry(leftRightWidth, leftRightHeight, leftRightDepth);
        const trailMaterial = new THREE.PointsMaterial({
            color: 0xffff00,
            size: 0.02,
            transparent: true,
            vertexColors: true // Permet d'utiliser des couleurs différentes pour chaque particule
        });
        // Créer la géométrie des particules
        const numParticles = 50; // Number of particles in the cloud
        const trailGeometry = new THREE.BufferGeometry();
        const trailPositions = new Float32Array(numParticles * 3); // Position array
        const trailColors = new Float32Array(numParticles * 3); // Color array (RGB)
        // Initialize particle positions and colors
        for (let i = 0; i < numParticles; i++) {
            // Randomize initial positions slightly around the origin
            trailPositions[i * 3] = Math.random() * 0.05 - 0.025; // x-axis offset
            trailPositions[i * 3 + 1] = Math.random() * 0.05 - 0.025; // y-axis offset
            trailPositions[i * 3 + 2] = Math.random() * 0.05 - 0.025; // z-axis offset
            // Initialize colors (fully opaque for new particles)
            trailColors[i * 3] = 1.0; // Red
            trailColors[i * 3 + 1] = 1.0; // Green
            trailColors[i * 3 + 2] = 0.0; // Blue
        }
        trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
        trailGeometry.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
        // Créer le système de particules
        this._trail = new THREE.Points(trailGeometry, trailMaterial);
        /* const vertices = new Float32Array([
            -30,  550, -1.0, // top-left
             810,  550, -1.0, // top-right
             810, 10, -1.0, // bottom-right
            -30, 10, -1.0, // bottom-left
            -30,  550, -1.0  // back to top-left to close the rectangle
        ]);

        const fieldGeometry = new THREE.BufferGeometry();
        fieldGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        const fieldMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const line = new THREE.Line(fieldGeometry, fieldMaterial); */
        //Create a mesh : element + material
        this._player = new THREE.Mesh(paddleGeometry, material);
        this._opponent = new THREE.Mesh(paddleGeometry, material);
        this._ball = new THREE.Mesh(ballGeometry, material);
        let velocity = new THREE.Vector3(0, 0, 0);
        this._ball.position.add(velocity);
        this._ball2 = new THREE.Mesh(ballGeometry, material);
        this._field = new THREE.Mesh(fieldGeometry, fieldMaterial);
        const top = new THREE.Mesh(topBotGeometry, wallMaterial);
        const left = new THREE.Mesh(leftRightGeometry, wallMaterial);
        const bot = new THREE.Mesh(topBotGeometry, wallMaterial);
        const right = new THREE.Mesh(leftRightGeometry, wallMaterial);
        this._previousVelocity = new THREE.Vector3();
        this._currentVelocity = new THREE.Vector3();
        this._prevBallPos = new THREE.Vector3();
        // this._ball2.position.set(0, 0, 0)
        this._player.position.set(0, 0, -1);
        this._opponent.position.set(0, 0, 1);
        this._ball.position.set(0, 0, 0);
        this._prevBallPos.set(0, 0, 0);
        this._field.position.set(0, -0.1, 0);
        bot.position.set(0, 0, -1.35);
        top.position.set(0, 0, 1.35);
        left.position.set(-1.075, 0, 0);
        right.position.set(1.075, 0, 0);
        this._scene.add(this._player, this._opponent, this._ball, /* this._ball2 ,*/ this._dLight, this._aLight, this._field, bot, top, left, right, this._trail);
    }
    isInScene(scene, object) {
        let isInScene = false;
        scene.traverse((child) => {
            if (child === object) {
                isInScene = true;
            }
        });
        return isInScene;
    }
    createShockwave(position) {
        const shockwaveGeometry = new THREE.RingGeometry(1, 1.2, 32);
        const shockwaveMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0.0 }, // Time uniform to control animation
                uMaxRadius: { value: .5 }, // Maximum radius for expansion
                uSpeed: { value: 1.0 }, // Speed of expansion
            },
            vertexShader: `
			  uniform float uTime;
			  uniform float uMaxRadius;
			  uniform float uSpeed;

			  void main() {
				vec3 pos = position * uMaxRadius * (uTime * uSpeed);
				gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
			  }
			`,
            fragmentShader: `
			  uniform float uTime;

			  void main() {
				float alpha = 1.0 - uTime;
				gl_FragColor = vec4(1.0, 1.0, 1.0, alpha); // White color with fading alpha
			  }
			`,
            transparent: true, // Allows for the fading effect
            side: THREE.DoubleSide // Make sure the shockwave is visible from both sides
        });
        const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial.clone());
        // Set the initial position of the shockwave
        shockwave.position.copy(position);
        // Add the shockwave to the scene
        this._scene.add(shockwave);
        // Animate the shockwave over time
        let elapsedTime = 0.0;
        const maxTime = 1.0; // Duration of the shockwave animation
        const speed = 1.0; // Expansion speed
        const animateShockwave = () => {
            elapsedTime += speed * 0.01;
            if (elapsedTime < maxTime) {
                shockwave.material.uniforms.uTime.value = elapsedTime / maxTime;
                requestAnimationFrame(animateShockwave); // Continue animating
            }
            else {
                this._scene.remove(shockwave); // Remove the shockwave once the animation is complete
                shockwave.geometry.dispose(); // Clean up geometry
                shockwave.material.dispose(); // Clean up material
            }
        };
        animateShockwave();
    }
    impact() {
        let currentPosition = this._ball.position.clone();
        this._currentVelocity.subVectors(currentPosition, this._prevBallPos);
        if ((this._currentVelocity.x > 0 && this._previousVelocity.x <= 0) ||
            (this._currentVelocity.x < 0 && this._previousVelocity.x >= 0) ||
            (this._currentVelocity.y > 0 && this._previousVelocity.y <= 0) ||
            (this._currentVelocity.y < 0 && this._previousVelocity.y >= 0) ||
            (this._currentVelocity.z > 0 && this._previousVelocity.z <= 0) ||
            (this._currentVelocity.z < 0 && this._previousVelocity.z >= 0)) {
            // The ball has changed direction
            this.createShockwave(this._ball.position);
        }
        this._previousVelocity.copy(this._currentVelocity);
        this._prevBallPos.copy(currentPosition);
    }
    animate() {
        requestAnimationFrame(this.animate);
        // Update the particles' positions and colors for fading effect
        const positions = this._trail.geometry.attributes.position.array;
        const colors = this._trail.geometry.attributes.color.array;
        console.log("les balls en y : ", this._ball.position.z);
        if (this._ball.position.z === 0.99 || this._ball.position.z === -0.99) {
            this._scene.remove(this._trail);
            return;
        }
        if (!this.isInScene(this._scene, this._trail))
            this._scene.add(this._trail);
        for (let i = positions.length - 3, j = (positions.length / 3) - 1; i >= 3; i -= 3, j--) {
            // Move each particle towards the previous particle's position with a slight random offset
            positions[i] = positions[i - 3] + (Math.random() * 0.02 - 0.01);
            positions[i + 1] = positions[i - 2] + (Math.random() * 0.02 - 0.01);
            positions[i + 2] = positions[i - 1] + (Math.random() * 0.02 - 0.01);
            // Calculate fading effect based on distance from the ball or position in the this._trail
            const fadeFactor = j / 50; // Fade based on position in the this._trail
            colors[i] = 1.0; /* * (1 - fadeFactor); */ // Red component fades out
            colors[i + 1] = 1.0; /**  (1 - fadeFactor); */ // Green component fades out
            colors[i + 2] = fadeFactor; // Blue component stays the same (yellow -> transparent yellow)
        }
        //Set the first particle to the current position of the ball with a random offset
        positions[0] = this._ball.position.x + (Math.random() * 0.05 - 0.025);
        positions[1] = this._ball.position.y + (Math.random() * 0.05 - 0.025);
        positions[2] = this._ball.position.z + (Math.random() * 0.05 - 0.025);
        /* for (let i = 0, j = 13; i < 148, j > 0; i += 3, j -=2) {
            // Move each particle towards the previous particle's position with a slight random offset
            let k = j / 2;
            for (let l = 0; l < j; l++)
            {
                positions[k] = positions[i] + ;
                positions[i + 4] = positions[i + 1] + ;
                positions[i + 5] = positions[i + 2] + (Math.random() * 0.02 - 0.01);

            }

            // Calculate fading effect based on distance from the ball or position in the this._trail
            const fadeFactor = (positions.length - i) / 80; // Fade based on position in the this._trail

            colors[i] = 1.0 * (1 - fadeFactor); // Red component fades out
            colors[i + 1] = 1.0 *  (1 - fadeFactor); // Green component fades out
            colors[i + 2] = fadeFactor; // Blue component stays the same (yellow -> transparent yellow)
        } */
        //	Set the first particle to the current position of the ball with a random offset
        positions[0] = this._ball.position.x + (Math.random() * 0.02 - 0.01);
        positions[1] = this._ball.position.y + (Math.random() * 0.02 - 0.01);
        positions[2] = this._ball.position.z + (Math.random() * 0.02 - 0.01);
        // New particles start fully opaque
        colors[0] = 1.0;
        colors[1] = 1.0;
        colors[2] = 0.0;
        // Inform Three.js that the attributes have changed
        this._trail.geometry.attributes.position.needsUpdate = true;
        this._trail.geometry.attributes.color.needsUpdate = true;
        this.impact();
    }
    moveToPosition() {
    }
    render(px, py, ox, oy, bx, by) {
        const controls = new OrbitControls(this._camera, this._renderer.domElement);
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
        controls.minZoom = 0.5;
        /* controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        };

        // For touch sensitivity
        controls.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
        }; */
        /* const cameraPositions = {
            position1: new THREE.Vector3(0, 2, 5),
            position2: new THREE.Vector3(5, 2, 0),
          }; */
        window.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'p':
                    this._camera.position.set(0, 2.5, 3);
                    this._camera.lookAt(0, 0, 0);
                    this._camera.up.set(0, 1, 0);
                    this._renderer.render(this._scene, this._camera);
                    break;
                case 'o':
                    this._camera.position.set(0, 2.5, -3);
                    this._camera.lookAt(0, 0, 0);
                    this._camera.up.set(0, -1, 0);
                    this._renderer.render(this._scene, this._camera);
                    break;
                case 'u':
                    this._camera.position.set(0, 3, 0);
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
        this._player.position.set(py + 62 / 600, 0, px);
        this._opponent.position.set(oy + 62 / 600, 0, ox);
        this._ball.position.set(by, 0, bx);
        console.log(this._player.position);
        console.log(this._opponent.position);
        console.log(this._ball.position);
        // this._player.position.x = px;
        // this._player.position.y = py;
        // this._opponent.position.x = ox;
        // this._opponent.position.y = oy;
        // this._ball.position.x = bx;
        // this._ball.position.y = by;
        this.animate();
        this._renderer.render(this._scene, this._camera);
        // requestAnimationFrame(render);
    }
    renderTimer(timer) {
        const cameraPaths = [
            { position: new THREE.Vector3(0, 2.5, 3), lookAt: new THREE.Vector3(0, 0, 0) },
            { position: new THREE.Vector3(2.5, 2.5, 2.5), lookAt: new THREE.Vector3(0, 0, 0) },
            { position: new THREE.Vector3(0, 2.5, 2), lookAt: new THREE.Vector3(0, 0, 0) },
            { position: new THREE.Vector3(-2.5, 2.5, 3.5), lookAt: new THREE.Vector3(0, 0, 0) },
            { position: new THREE.Vector3(0, 0, 5), lookAt: new THREE.Vector3(0, 0, 0) }
        ];
        let startTime;
        let currentStep = 0;
        const animateCamera = (time) => {
            if (!startTime)
                startTime = time;
            const elapsedTime = (time - startTime) / 1000; // Convert to seconds
            // Calculate the progress of the animation
            const progress = elapsedTime; // Duration of each segment (5 seconds for example)
            if (progress < 1) {
                // Interpolate camera position
                const from = cameraPaths[currentStep];
                const to = cameraPaths[currentStep + 1];
                this._camera.position.lerpVectors(from.position, to.position, progress);
                this._camera.lookAt(to.lookAt);
            }
            else {
                // Move to the next step
                currentStep++;
                if (currentStep < cameraPaths.length - 1) {
                    startTime = time; // Reset start time for the next segment
                }
                else {
                    // End of introduction
                    return;
                }
            }
            this._renderer.render(this._scene, this._camera);
            requestAnimationFrame(animateCamera);
        };
        animateCamera(0);
        /* const loader = new TTFLoader();
        let geometry
        let font

        loader.load( '../../../fonts/Epilogue-Bold.ttf', function ( foont ) {

            font = new Font(foont)
            geometry = new TextGeometry( String(5 - timer), {
                font: font,
                size: 5,
                depth: 2,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 10,
                bevelSize: 8,
                bevelOffset: 0,
                bevelSegments: 5
            } );
        } );
        const material = new THREE.MeshBasicMaterial({ color: 0xDAFFFF })
        //const sentence = new THREE.Mesh(loader.load())
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, 2)
        this._scene.add(mesh) */
        // this._renderer.render(this._scene, this._camera);
        //this._context.fillText(String(5 - timer), screenWidth / 2, screenHeight / 2)
    }
    // _renderer;
    // _camera;
    // _scene;
    // _dLight;
    // _aLight;
    // _player;
    // _opponent;
    // _ball;
    _renderer;
    _scene;
    _camera;
    _dLight;
    _aLight;
    _player;
    _opponent;
    _ball;
    _field;
    _ball2;
    _trail;
    _previousVelocity;
    _currentVelocity;
    _prevBallPos;
}
;
export { ThreeD };
