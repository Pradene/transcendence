/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Ball.js":
/*!*********************!*\
  !*** ./src/Ball.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Ball: () => (/* binding */ Ball)\n/* harmony export */ });\nconst ball_size = 4;\nclass Ball {\n    constructor(position) {\n        this._position = position;\n    }\n    get position() {\n        return this._position;\n    }\n    set position(value) {\n        this._position = value;\n    }\n    display(canvas) {\n        canvas.fillRect(this._position.x, this._position.y, ball_size, ball_size);\n    }\n    _position;\n}\n\n\n\n//# sourceURL=webpack://pong-script/./src/Ball.js?");

/***/ }),

/***/ "./src/DomElements.js":
/*!****************************!*\
  !*** ./src/DomElements.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   AVAILABLEGAMECONTAINER: () => (/* binding */ AVAILABLEGAMECONTAINER),\n/* harmony export */   AVAILABLETOURNAMENTCONTAINER: () => (/* binding */ AVAILABLETOURNAMENTCONTAINER),\n/* harmony export */   GAMECONTAINER: () => (/* binding */ GAMECONTAINER),\n/* harmony export */   USERSCONTAINER: () => (/* binding */ USERSCONTAINER),\n/* harmony export */   activateButtons: () => (/* binding */ activateButtons),\n/* harmony export */   deactivateButtons: () => (/* binding */ deactivateButtons)\n/* harmony export */ });\n/* harmony import */ var _GameSocket__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./GameSocket */ \"./src/GameSocket.js\");\n\nlet CREATEGAMEBUTTON = document.querySelector(\"div.game-container button.create-game\");\nlet CREATETOURNAMENTBUTTON = document.querySelector(\"div.game-container button.create-tournament\");\nlet REFRESHBUTTON = document.querySelector(\"div.game-container button.refresh-room\");\nlet AVAILABLEGAMECONTAINER = document.querySelector(\"div.game-container div.available-game\");\nlet AVAILABLETOURNAMENTCONTAINER = document.querySelector(\"div.game-container div.available-tournament\");\nlet GAMECONTAINER = document.querySelector(\"div.game-container div.game\");\nlet USERSCONTAINER = document.querySelector(\"div.game-container div.user-list\");\nconst FIRST_LINK = document.querySelectorAll(\"nav div a[data-link]\");\nconst HOME_LINK = document.querySelector(\"nav > a\");\nfunction regenerateButtons() {\n    CREATEGAMEBUTTON = document.querySelector(\"div.game-container button.create-game\");\n    CREATETOURNAMENTBUTTON = document.querySelector(\"div.game-container button.create-tournament\");\n    REFRESHBUTTON = document.querySelector(\"div.game-container button.refresh-room\");\n    AVAILABLEGAMECONTAINER = document.querySelector(\"div.game-container div.available-game\");\n    AVAILABLETOURNAMENTCONTAINER = document.querySelector(\"div.game-container div.available-tournament\");\n    GAMECONTAINER = document.querySelector(\"div.game-container div.game\");\n    USERSCONTAINER = document.querySelector(\"div.game-container div.user-list\");\n}\n/**\n * Request a new game to be created //TODO check for race condition\n */\nasync function createGameButtonCallback() {\n    let gs = await _GameSocket__WEBPACK_IMPORTED_MODULE_0__.GameSocket.get();\n    gs.requestNewGame();\n}\nasync function refreshButtonCallback() {\n    let gs = await _GameSocket__WEBPACK_IMPORTED_MODULE_0__.GameSocket.get();\n    gs.requestGames();\n}\nasync function createTournamentButtonCallback() {\n    let gs = await _GameSocket__WEBPACK_IMPORTED_MODULE_0__.GameSocket.get();\n    gs.requestNewTournament();\n}\n/**\n * Activate a button\n * @param button\n */\nfunction activateButton(button) {\n    button.classList.add(\"active\");\n}\n/**\n * Deactivate a button\n * @param button\n */\nfunction deactivateButton(button) {\n    button.classList.remove(\"active\");\n}\n/**\n * Activate the buttons, is called when the websocket finished connecting\n */\nfunction activateButtons() {\n    regenerateButtons();\n    CREATEGAMEBUTTON.addEventListener(\"click\", createGameButtonCallback);\n    CREATETOURNAMENTBUTTON.addEventListener(\"click\", createTournamentButtonCallback);\n    REFRESHBUTTON.addEventListener(\"click\", refreshButtonCallback);\n    activateButton(CREATEGAMEBUTTON);\n    activateButton(CREATETOURNAMENTBUTTON);\n    activateButton(REFRESHBUTTON);\n    // Close the socket when the user navigates away\n    FIRST_LINK.forEach((link) => {\n        link.addEventListener(\"click\", async (event) => {\n            let gs = await _GameSocket__WEBPACK_IMPORTED_MODULE_0__.GameSocket.get();\n            gs.close();\n        });\n    });\n    // Reopen the socket when the user navigates back\n    HOME_LINK.addEventListener(\"click\", async (event) => {\n        let gs = await _GameSocket__WEBPACK_IMPORTED_MODULE_0__.GameSocket.get();\n    });\n}\n/**\n * Disable buttons, should be called on lost connection //TODO call it\n */\nfunction deactivateButtons() {\n    CREATEGAMEBUTTON.removeEventListener(\"click\", createGameButtonCallback);\n    REFRESHBUTTON.removeEventListener(\"click\", refreshButtonCallback);\n    deactivateButton(CREATEGAMEBUTTON);\n    deactivateButton(REFRESHBUTTON);\n}\n\n\n\n//# sourceURL=webpack://pong-script/./src/DomElements.js?");

/***/ }),

/***/ "./src/GameSocket.js":
/*!***************************!*\
  !*** ./src/GameSocket.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GameSocket: () => (/* binding */ GameSocket)\n/* harmony export */ });\n/* harmony import */ var _Pong__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Pong */ \"./src/Pong.js\");\n/* harmony import */ var _DomElements__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DomElements */ \"./src/DomElements.js\");\n\n\nconst hosturl = \"wss://\" + location.hostname + \":\" + location.port + \"/ws/game\";\nclass GameSocket {\n    constructor(socket) {\n        this._websocket = socket;\n        this._currentGame = null;\n        this._websocket.onmessage = this.redirectMessages;\n    }\n    /**\n     * Access global GameSocket instance.\n     */\n    static async get() {\n        if (GameSocket.#GameSocket === null) {\n            const socket = await new Promise((resolve, reject) => {\n                let ws = new WebSocket(hosturl);\n                console.log(\"Connecting to server...\");\n                ws.onopen = () => {\n                    resolve(ws);\n                };\n                ws.onerror = (e) => {\n                    reject(e);\n                };\n            }).then((ws) => {\n                console.log(\"Connected to server.\");\n                (0,_DomElements__WEBPACK_IMPORTED_MODULE_1__.activateButtons)();\n                return ws;\n            }).catch((e) => {\n                throw new Error(\"Failed to connect to server: \" + e);\n            });\n            this.#GameSocket = new GameSocket(socket);\n        }\n        return GameSocket.#GameSocket;\n    }\n    /**\n     * Request the server to send all currently running games.\n     */\n    requestGames() {\n        let request = {\n            method: \"get_games\"\n        };\n        this.send(request);\n    }\n    processGetUsers(response) {\n        _DomElements__WEBPACK_IMPORTED_MODULE_1__.USERSCONTAINER.innerHTML = \"<h2>Users:</h2>\";\n        response.data.users.forEach((element) => {\n            let user = document.createElement(\"p\");\n            user.textContent = element;\n            _DomElements__WEBPACK_IMPORTED_MODULE_1__.USERSCONTAINER.appendChild(user);\n        });\n    }\n    processGetGames(response) {\n        let games = response.data.games;\n        let tournaments = response.data.tournaments;\n        // clean containers\n        _DomElements__WEBPACK_IMPORTED_MODULE_1__.AVAILABLEGAMECONTAINER.innerHTML = \"\";\n        _DomElements__WEBPACK_IMPORTED_MODULE_1__.AVAILABLETOURNAMENTCONTAINER.innerHTML = \"\";\n        // insert elements\n        games.forEach(element => {\n            this.processOneGame(element.creator, element.player_count, element.is_full);\n        });\n        tournaments.forEach(element => {\n            this.processOneTournament(element.creator, element.player_count, element.is_full);\n        });\n    }\n    processOneGame(creator, player_count, is_full) {\n        let game_container = document.createElement(\"div\");\n        let creator_element = document.createElement(\"span\");\n        let player_count_element = document.createElement(\"span\");\n        let join_button = document.createElement(\"button\");\n        game_container.classList.add(\"room\");\n        creator_element.classList.add(\"gameid\");\n        player_count_element.classList.add(\"player-count\");\n        creator_element.textContent = creator;\n        player_count_element.textContent = player_count + \"/2\";\n        join_button.textContent = \"Join\";\n        join_button.addEventListener(\"click\", () => {\n            let request = {\n                method: \"join_game\",\n                data: {\n                    gameid: creator\n                }\n            };\n            this.send(request);\n        });\n        join_button.disabled = is_full;\n        game_container.appendChild(creator_element);\n        game_container.appendChild(player_count_element);\n        game_container.appendChild(join_button);\n        _DomElements__WEBPACK_IMPORTED_MODULE_1__.AVAILABLEGAMECONTAINER.appendChild(game_container);\n    }\n    processOneTournament(creator, player_count, is_full) {\n        let tournament_container = document.createElement(\"div\");\n        let creator_element = document.createElement(\"span\");\n        let player_count_element = document.createElement(\"span\");\n        let join_button = document.createElement(\"button\");\n        tournament_container.classList.add(\"room\");\n        creator_element.classList.add(\"gameid\");\n        player_count_element.classList.add(\"player-count\");\n        creator_element.textContent = creator;\n        player_count_element.textContent = player_count + \"/4\";\n        join_button.textContent = \"Join\";\n        join_button.addEventListener(\"click\", () => {\n            let request = {\n                method: \"join_game\",\n                data: {\n                    gameid: creator\n                }\n            };\n            this.send(request);\n        });\n        join_button.disabled = is_full;\n        tournament_container.appendChild(creator_element);\n        tournament_container.appendChild(player_count_element);\n        tournament_container.appendChild(join_button);\n        _DomElements__WEBPACK_IMPORTED_MODULE_1__.AVAILABLETOURNAMENTCONTAINER.appendChild(tournament_container);\n    }\n    /**\n     * Request the server to create a new game instance.\n     */\n    requestNewGame() {\n        console.log(\"Requesting new game\");\n        if (this._currentGame) {\n            console.error(\"Already in a game\");\n            return;\n        }\n        let request = {\n            method: \"create_game\",\n            data: {}\n        };\n        this.send(request);\n    }\n    requestNewTournament() {\n        if (this._currentGame) {\n            return;\n        }\n        let request = {\n            method: \"create_tournament\",\n            data: {}\n        };\n        this.send(request);\n    }\n    /**\n     * Create a new game\n     * @param response\n     */\n    createNewGame(response) {\n        if (!response.status) {\n            console.error(\"Could not create new game: \", response.reason);\n        }\n    }\n    /**\n     * Send a request to the server\n     * @param request The request to be send\n     */\n    send(request) {\n        console.log(\"Sending request: \", request);\n        this._websocket.send(JSON.stringify(request));\n    }\n    /**\n     * Parse messages from the server.\n     * @param event\n     */\n    async redirectMessages(event) {\n        let gs = await GameSocket.get();\n        let response = JSON.parse(event.data);\n        console.log(\"Received message\", response);\n        //check for error\n        if (!response.status) {\n            alert(\"Error: \" + response.reason);\n            return;\n        }\n        //here global events\n        switch (response.method) {\n            case \"get_games\":\n                gs.processGetGames(response);\n                break;\n            case \"get_users\":\n                gs.processGetUsers(response);\n                break;\n            case \"create_game\":\n                gs.createNewGame(response);\n                break;\n            case \"update_game\":\n                if (!gs._currentGame)\n                    gs._currentGame = new _Pong__WEBPACK_IMPORTED_MODULE_0__.Pong();\n                break;\n        }\n        //here game events\n        if (gs._currentGame) {\n            gs._currentGame.parseMessage(response);\n        }\n    }\n    removeGame() {\n        this._currentGame = null;\n    }\n    close() {\n        this._currentGame?.stop();\n        this.removeGame();\n        this._websocket.close();\n        GameSocket.#GameSocket = null;\n        console.log(\"Closing game socket\");\n    }\n    _websocket;\n    _currentGame;\n    static #GameSocket = null;\n}\n\n\n\n//# sourceURL=webpack://pong-script/./src/GameSocket.js?");

/***/ }),

/***/ "./src/Player.js":
/*!***********************!*\
  !*** ./src/Player.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   CurrentPlayer: () => (/* binding */ CurrentPlayer),\n/* harmony export */   Player: () => (/* binding */ Player)\n/* harmony export */ });\n/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Utils */ \"./src/Utils.js\");\n/* harmony import */ var _GameSocket__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./GameSocket */ \"./src/GameSocket.js\");\n\n\nconst default_height = 32 * 2;\nconst default_width = 8;\n/**\n * Represents a player in the game.\n */\nclass Player {\n    get position() {\n        return this._position;\n    }\n    set position(value) {\n        this._position = value;\n    }\n    get name() {\n        return this._name;\n    }\n    set name(nname) {\n        this._name = nname;\n    }\n    setScore(value) {\n        this._score = value;\n    }\n    constructor(name, position) {\n        this._name = name;\n        this._position = position;\n        this._score = 0;\n    }\n    /**\n     * Set the position of the player from an array.\n     * @param arr Array of two numbers.\n     * @return void\n     * */\n    setPositionFromArray(arr) {\n        this.position = new _Utils__WEBPACK_IMPORTED_MODULE_0__.Position(arr[0], arr[1]);\n    }\n    /**\n     * Display the player on the canvas.\n     * @param canvas\n     */\n    display(canvas) {\n        canvas.fillRect(this._position.x, this._position.y, default_width, default_height);\n        canvas.font = \"20px Arial\";\n        canvas.fillText(String(this._score), this._position.x, 20);\n    }\n    stop() {\n    }\n    _name;\n    _position;\n    _score;\n}\n/**\n * Represents the current player in the game.\n */\nclass CurrentPlayer extends Player {\n    constructor(name, position) {\n        super(name, position);\n        this._movement = \"NONE\";\n        this._boundHandlerUp = this._keyUpHandler.bind(this);\n        this._boundHandlerDown = this._keyDownHandler.bind(this);\n        window.addEventListener(\"keypress\", this._boundHandlerDown);\n        window.addEventListener(\"keyup\", this._boundHandlerUp);\n    }\n    _keyDownHandler(event) {\n        if (event.key === \"w\")\n            this.movement = \"UP\";\n        else if (event.key === \"s\")\n            this.movement = \"DOWN\";\n    }\n    _keyUpHandler(event) {\n        this.movement = \"NONE\";\n    }\n    /**\n     * Update the player's movement on the server.\n     * @private\n     */\n    async _update() {\n        let gs = await _GameSocket__WEBPACK_IMPORTED_MODULE_1__.GameSocket.get();\n        let request = {\n            method: \"update_player\",\n            data: {\n                movement: this._movement\n            }\n        };\n        gs.send(request);\n    }\n    set movement(value) {\n        if (this._movement === value)\n            return;\n        this._movement = value;\n        this._update().then(r => { });\n    }\n    stop() {\n        super.stop();\n        clearInterval(this._intervalid);\n        window.removeEventListener(\"keypress\", this._keyDownHandler);\n        window.removeEventListener(\"keyup\", this._keyUpHandler);\n    }\n    _intervalid;\n    _movement;\n    _boundHandlerUp;\n    _boundHandlerDown;\n}\n\n\n\n//# sourceURL=webpack://pong-script/./src/Player.js?");

/***/ }),

/***/ "./src/Pong.js":
/*!*********************!*\
  !*** ./src/Pong.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Pong: () => (/* binding */ Pong)\n/* harmony export */ });\n/* harmony import */ var _Player__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Player */ \"./src/Player.js\");\n/* harmony import */ var _Ball__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Ball */ \"./src/Ball.js\");\n/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Utils */ \"./src/Utils.js\");\n/* harmony import */ var _GameSocket__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./GameSocket */ \"./src/GameSocket.js\");\n/* harmony import */ var _DomElements__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./DomElements */ \"./src/DomElements.js\");\n\n\n\n\n\nconst screenWidth = 800;\nconst screenHeight = 600;\nconst colors = {\n    waiting: {\n        background: \"#000000ff\",\n        border: \"#ffffffff\",\n        text: \"#ffffffff\"\n    },\n    running: {\n        background: \"#000000ff\",\n        text: \"#ffffffff\",\n        player: \"#ffffffff\",\n        border: \"#ffffffff\"\n    }\n};\nclass Pong {\n    constructor() {\n        this._current_player = undefined;\n        this._opponent = undefined;\n        this._canvas = document.createElement(\"canvas\");\n        this._context = this._canvas.getContext(\"2d\");\n        this._ball = new _Ball__WEBPACK_IMPORTED_MODULE_1__.Ball(new _Utils__WEBPACK_IMPORTED_MODULE_2__.Position(0, 0));\n        this._running = false;\n        //set the canvas properties\n        this._canvas.style.backgroundColor = colors.waiting.background;\n        this._canvas.style.border = \"solid 1px \" + colors.waiting.border;\n        this._canvas.width = screenWidth;\n        this._canvas.height = screenHeight;\n        _DomElements__WEBPACK_IMPORTED_MODULE_4__.GAMECONTAINER.appendChild(this._canvas);\n    }\n    /**\n     * Display the game\n     */\n    display(status, timer) {\n        if (!status) {\n            this._canvas.style.backgroundColor = colors.waiting.background;\n            this._context.clearRect(0, 0, screenWidth, screenHeight);\n            this._context.font = \"30px Arial\";\n            this._context.fillStyle = colors.waiting.text;\n            this._context.fillText(\"Waiting for opponent\", 10, 50);\n            return;\n        }\n        this._canvas.style.backgroundColor = colors.running.background;\n        this._context.clearRect(0, 0, screenWidth, screenHeight);\n        this._context.fillStyle = colors.running.player;\n        this._current_player?.display(this._context);\n        this._opponent?.display(this._context);\n        this._ball.display(this._context);\n    }\n    displayTimer(timer) {\n        this._canvas.style.backgroundColor = colors.running.background;\n        this._context.clearRect(0, 0, screenWidth, screenHeight);\n        this._context.fillStyle = colors.running.player;\n        this._context.font = \"30px Arial\";\n        this._context.fillText(String(5 - timer), screenWidth / 2, screenHeight / 2);\n    }\n    /**\n     * Stop the game\n     */\n    async stop() {\n        let gs = await _GameSocket__WEBPACK_IMPORTED_MODULE_3__.GameSocket.get();\n        this._current_player?.stop();\n        _DomElements__WEBPACK_IMPORTED_MODULE_4__.GAMECONTAINER.removeChild(this._canvas);\n        gs.removeGame();\n    }\n    /**\n     * Update the game data and display it.\n     * @param response\n     * @private\n     */\n    update(response) {\n        if (!this._current_player) {\n            this._current_player = new _Player__WEBPACK_IMPORTED_MODULE_0__.CurrentPlayer(\"a name\", new _Utils__WEBPACK_IMPORTED_MODULE_2__.Position(0, 0));\n            this._opponent = new _Player__WEBPACK_IMPORTED_MODULE_0__.Player(\"another name\", new _Utils__WEBPACK_IMPORTED_MODULE_2__.Position(0, 0));\n        }\n        if (response.data.status === \"finished\") {\n            this.stop();\n        }\n        this._current_player?.setPositionFromArray(response.data.current_player.position);\n        this._opponent?.setPositionFromArray(response.data.opponent.position);\n        this._current_player?.setScore(response.data.current_player.score);\n        this._opponent?.setScore(response.data.opponent.score);\n        this._ball.position = new _Utils__WEBPACK_IMPORTED_MODULE_2__.Position(response.data.ball[0], response.data.ball[1]);\n        this._running = response.data.status === \"running\";\n        //now redisplay the game\n        let timer = response.data.timer;\n        if (typeof timer === \"undefined\")\n            this.display(response.data.status === \"running\");\n        else\n            this.displayTimer(timer);\n    }\n    /**\n     * Parse a response from the server meant for the game\n     * @param response\n     */\n    parseMessage(response) {\n        console.log(response[\"method\"]);\n        switch (response.method) {\n            case \"update_game\":\n                this.update(response);\n                break;\n            default:\n                break;\n        }\n    }\n    get canvas() {\n        return this._canvas;\n    }\n    get running() {\n        return this._running;\n    }\n    set running(status) {\n        if (!this.running && status) {\n            //TODO start game (player key input catch)\n            this._running = true;\n        }\n        else if (this.running && !status) {\n            this.stop(); //game is not running anymore\n            this._running = false;\n        }\n    }\n    _canvas;\n    _context;\n    _current_player;\n    _opponent;\n    _ball;\n    _running;\n}\n\n\n\n//# sourceURL=webpack://pong-script/./src/Pong.js?");

/***/ }),

/***/ "./src/Utils.js":
/*!**********************!*\
  !*** ./src/Utils.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Position: () => (/* binding */ Position)\n/* harmony export */ });\nclass Position {\n    x;\n    y;\n    constructor(x, y) {\n        this.x = x;\n        this.y = y;\n    }\n}\n\n\n\n//# sourceURL=webpack://pong-script/./src/Utils.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _GameSocket__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./GameSocket */ \"./src/GameSocket.js\");\n\nconst sock = await _GameSocket__WEBPACK_IMPORTED_MODULE_0__.GameSocket.get();\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } }, 1);\n\n//# sourceURL=webpack://pong-script/./src/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/async module */
/******/ 	(() => {
/******/ 		var webpackQueues = typeof Symbol === "function" ? Symbol("webpack queues") : "__webpack_queues__";
/******/ 		var webpackExports = typeof Symbol === "function" ? Symbol("webpack exports") : "__webpack_exports__";
/******/ 		var webpackError = typeof Symbol === "function" ? Symbol("webpack error") : "__webpack_error__";
/******/ 		var resolveQueue = (queue) => {
/******/ 			if(queue && queue.d < 1) {
/******/ 				queue.d = 1;
/******/ 				queue.forEach((fn) => (fn.r--));
/******/ 				queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
/******/ 			}
/******/ 		}
/******/ 		var wrapDeps = (deps) => (deps.map((dep) => {
/******/ 			if(dep !== null && typeof dep === "object") {
/******/ 				if(dep[webpackQueues]) return dep;
/******/ 				if(dep.then) {
/******/ 					var queue = [];
/******/ 					queue.d = 0;
/******/ 					dep.then((r) => {
/******/ 						obj[webpackExports] = r;
/******/ 						resolveQueue(queue);
/******/ 					}, (e) => {
/******/ 						obj[webpackError] = e;
/******/ 						resolveQueue(queue);
/******/ 					});
/******/ 					var obj = {};
/******/ 					obj[webpackQueues] = (fn) => (fn(queue));
/******/ 					return obj;
/******/ 				}
/******/ 			}
/******/ 			var ret = {};
/******/ 			ret[webpackQueues] = x => {};
/******/ 			ret[webpackExports] = dep;
/******/ 			return ret;
/******/ 		}));
/******/ 		__webpack_require__.a = (module, body, hasAwait) => {
/******/ 			var queue;
/******/ 			hasAwait && ((queue = []).d = -1);
/******/ 			var depQueues = new Set();
/******/ 			var exports = module.exports;
/******/ 			var currentDeps;
/******/ 			var outerResolve;
/******/ 			var reject;
/******/ 			var promise = new Promise((resolve, rej) => {
/******/ 				reject = rej;
/******/ 				outerResolve = resolve;
/******/ 			});
/******/ 			promise[webpackExports] = exports;
/******/ 			promise[webpackQueues] = (fn) => (queue && fn(queue), depQueues.forEach(fn), promise["catch"](x => {}));
/******/ 			module.exports = promise;
/******/ 			body((deps) => {
/******/ 				currentDeps = wrapDeps(deps);
/******/ 				var fn;
/******/ 				var getResult = () => (currentDeps.map((d) => {
/******/ 					if(d[webpackError]) throw d[webpackError];
/******/ 					return d[webpackExports];
/******/ 				}))
/******/ 				var promise = new Promise((resolve) => {
/******/ 					fn = () => (resolve(getResult));
/******/ 					fn.r = 0;
/******/ 					var fnQueue = (q) => (q !== queue && !depQueues.has(q) && (depQueues.add(q), q && !q.d && (fn.r++, q.push(fn))));
/******/ 					currentDeps.map((dep) => (dep[webpackQueues](fnQueue)));
/******/ 				});
/******/ 				return fn.r ? promise : getResult();
/******/ 			}, (err) => ((err ? reject(promise[webpackError] = err) : outerResolve(exports)), resolveQueue(queue)));
/******/ 			queue && queue.d < 0 && (queue.d = 0);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;