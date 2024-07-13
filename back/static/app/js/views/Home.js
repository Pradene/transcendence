import { AbstractView } from "./AbstractView.js"

export class Home extends AbstractView {
    constructor() {
        super()
    }

    async getHtml() {
        const head = document.querySelector('head')
        const script = document.createElement('script')
        script.src = 'static/scripts/pong/dist/main.js'
        head.appendChild(script)

        return `
        <nav-component></nav-component>
        <h1>Hello World</h1>
        <div class="game-container"> <!-- Game Container, contain the game and the list of available rooms -->
		    <div class="game-container-header">
		    	<button class="create-game">Create Game</button> <!-- Create Game Button -->
		    	<button class="create-tournament">Create Tournament</button> <!-- Create Tournament Button -->
		    	<button class="refresh-room">Refresh Room</button> <!-- Refresh Room Button -->
		    </div>
		    <div class="game"></div> <!-- Game Container, contain the game -->
		    <div class="available-games"> <!-- Available Games Container, contain the list of available games -->
		    	<div class="available-game"></div> <!-- Available Game Container, contain the list of available games -->
		    	<div class="available-tournament"></div> <!-- Available Tournament Container, contain the list of available tournaments -->
		    </div>
	    </div>
        <script src="/static/scrips/pong/dist/main.js" type="application/javascript"></script>
        `
    }
}