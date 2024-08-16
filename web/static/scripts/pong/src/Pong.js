import { CurrentPlayer, Player } from "./Player";
import { Ball } from "./Ball";
import { ThreeD } from "./3D";
import { Position } from "./Utils";
import { GameSocket } from "./GameSocket";
import { GAMECONTAINER } from "./DomElements";
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js';
const screenWidth = 800;
const screenHeight = 600;
const colors = {
    waiting: {
        background: "#000000ff",
        border: "#ffffffff",
        text: "#ffffffff"
    },
    running: {
        background: "#000000ff",
        text: "#ffffffff",
        player: "#ffffffff",
        border: "#ffffffff"
    }
};
class Pong {
    constructor() {
        const canvas = document.createElement("canvas");
        //set the canvas properties
        canvas.style.backgroundColor = colors.waiting.background;
        canvas.style.border = "solid 1px " + colors.waiting.border;
        canvas.width = screenWidth;
        canvas.height = screenHeight;
        this._current_player = undefined;
        this._opponent = undefined;
        this._threeD = undefined;
        this._canvas = canvas;
        this._renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
        this._scene = new THREE.Scene();
        const fov = 60; //field of view
        const aspect = 1.33;
        const near = 0.1; //where the render start
        const far = 10; //where the render stop
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(0, 2.5, 3); //position of the camera on the z axis
        this._camera.lookAt(0, 0, 0);
        //this._context        = this._canvas.getContext("2d")!;
        this._ball = new Ball(new Position(0, 0));
        this._running = false;
        GAMECONTAINER.appendChild(this._canvas);
    }
    /**
     * Display the game
     */
    display(status, timer) {
        if (!status) {
            /* this._camera.position.set(400, 300, 250); //position of the camera on the z axis
            this._camera.lookAt(400, 300, 0) */
            const loader = new TTFLoader();
            let geometry;
            let font;
            loader.load('../../../fonts/Epilogue-Bold.ttf', function (foont) {
                font = new Font(foont);
                geometry = new TextGeometry("Waiting for an opponent...", {
                    font: font,
                    size: 1,
                    depth: 0.5,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 1,
                    bevelSize: 1,
                    bevelOffset: 0,
                    bevelSegments: 5
                });
            });
            const material = new THREE.MeshBasicMaterial({ color: 0xDAFFFF });
            //const sentence = new THREE.Mesh(loader.load())
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(0, 1, 0);
            this._scene.add(mesh);
            this._renderer.render(this._scene, this._camera);
            return;
        }
        this._canvas.style.backgroundColor = colors.running.background;
        ////this._context.clearRect(0, 0, screenWidth, screenHeight);
        if (this._threeD && this._current_player && this._opponent) {
            this._threeD.render(this._current_player.position.x / 800 * 2 - 1, this._current_player.position.y / 600 * 2 - 1, this._opponent.position.x / 800 * 2 - 1, this._opponent.position.y / 600 * 2 - 1, this._ball.position.x / 800 * 2 - 1, this._ball.position.y / 600 * 2 - 1);
        }
        console.log("on est passe par la \n");
        /*
                //this._context.fillStyle = colors.running.player;
                this._current_player?.display(//this._context);
                this._opponent?.display(//this._context);
        
                this._ball.display(//this._context); */
    }
    displayTimer(timer) {
        this._canvas.style.backgroundColor = colors.running.background;
        this._threeD?.renderTimer(timer);
        console.log("OOOOOOOOOOOOOOOOOOOOOOOOOOUHO !");
        //this._context.clearRect(0, 0, screenWidth, screenHeight);
        //this._context.fillStyle = colors.running.player;
        //this._context.font      = "30px Arial";
        //this._context.fillText(String(5 - timer), screenWidth / 2, screenHeight / 2);
    }
    /**
     * Stop the game
     */
    async stop() {
        let gs = await GameSocket.get();
        this._current_player?.stop();
        GAMECONTAINER.removeChild(this._canvas);
        gs.removeGame();
    }
    /**
     * Update the game data and display it.
     * @param response
     * @private
     */
    update(response) {
        console.log("responnnnnse:", response);
        if (!this._current_player) {
            this._current_player = new CurrentPlayer("a name", new Position(0, 0));
            this._opponent = new Player("another name", new Position(0, 0));
            this._threeD = new ThreeD(this._renderer, this._scene, this._camera, this._current_player.position.x, this._current_player.position.y, this._opponent.position.x, this._opponent.position.y, this._ball.position.x, this._ball.position.y);
        }
        if (response.data.status === "finished") {
            this.stop();
        }
        this._current_player?.setPositionFromArray(response.data.current_player.position);
        this._opponent?.setPositionFromArray(response.data.opponent.position);
        this._current_player?.setScore(response.data.current_player.score);
        this._opponent?.setScore(response.data.opponent.score);
        this._ball.position = new Position(response.data.ball[0], response.data.ball[1]);
        this._running = response.data.status === "running";
        //now redisplay the game
        let timer = response.data.timer;
        if (typeof timer === "undefined")
            this.display(response.data.status === "running");
        else
            this.displayTimer(timer);
    }
    /**
     * Parse a response from the server meant for the game
     * @param response
     */
    parseMessage(response) {
        console.log(response["method"]);
        switch (response.method) {
            case "update_game":
                this.update(response);
                break;
            default:
                break;
        }
    }
    get canvas() {
        return this._canvas;
    }
    get running() {
        return this._running;
    }
    set running(status) {
        if (!this.running && status) {
            //TODO start game (player key input catch)
            this._running = true;
        }
        else if (this.running && !status) {
            this.stop(); //game is not running anymore
            this._running = false;
        }
    }
    _scene;
    _renderer;
    _camera;
    _canvas;
    // private _context: CanvasRenderingContext2D;
    _current_player;
    _opponent;
    _ball;
    _running;
    _threeD;
}
export { Pong };
