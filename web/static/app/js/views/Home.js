import { AbstractView } from "./AbstractView.js"

let game_loaded = false

export class Home extends AbstractView {
    constructor() {
        super()
    }

    getHtml() {

        return `
        <nav-component></nav-component>
        <h1>Hello World</h1><br><br>
        <div class="game-container"> <!-- Game Container, contain the game and the list of available rooms -->
		    <div class="game-container-header">
		    	<div class="settings">
					<input type="radio" name="none" id="none">
		    	    <label for="none">None</label>
		    	    <input type="radio" name="storm" id="storm">
		    	    <label for="storm">Storm</label>
		    	    <input type="radio" name="wind" id="wind">
		    	    <label for="wind">Wind</label>
		    	    <input type="radio" name="geo" id="geo">
		    	    <label for="geo">Geo</label>
		    	</div>
				<button class="create-game">Create Game</button> <!-- Create Game Button -->
		    	<button class="create-tournament">Create Tournament</button> <!-- Create Tournament Button -->
		    	<button class="refresh-room">Refresh Room</button> <!-- Refresh Room Button -->
		    </div><br>
		    <div class="container">
		        <div class="user-list"></div>
		        <div class="game"></div>
		    </div>
		    <div class="available-games"> <!-- Available Games Container, contain the list of available games -->
		    	<div class="available-game"></div> <!-- Available Game Container, contain the list of available games -->
		    	<div class="available-tournament"></div> <!-- Available Tournament Container, contain the list of available tournaments -->
		    </div>
	    </div>
        `
    }

    async render(container) {
        container.innerHTML = this.getHtml()
        this.addEventListeners()

        if (!game_loaded) {
            const script = document.createElement('script')
            const appcontainer = document.querySelector('div#app')
            script.src = 'static/scripts/pong/dist/main.js'
            appcontainer.appendChild(script)
            // game_loaded = true
        }
    }
}
