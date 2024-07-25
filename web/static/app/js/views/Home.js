import { AbstractView } from "./AbstractView.js"

let game_loaded = false

export class Home extends AbstractView {
    constructor() {
        super()
    }

    getHtml() {

        return `
        <nav-component></nav-component>
        <div class="game-container"> <!-- Game Container, contain the game and the list of available rooms -->
		    <div class="game-container-header">
		    	<button class="create-game">Create Game</button> <!-- Create Game Button -->
		    	<button class="create-tournament">Create Tournament</button> <!-- Create Tournament Button -->
		    	<button class="refresh-room">Refresh Room</button> <!-- Refresh Room Button -->
		    	<div class="settings">
    		    	<fieldset>
    		    		<legend>Settings</legend>
    		    		<div><label for="none">None</label><input type="radio" name="settings" id="none" checked></div>
    		    		<div><label for="wind">Wind</label><input type="radio" name="settings" id="wind"></div>
    		    		<div><label for="geo">Geo</label><input type="radio" name="settings" id="geo"></div>
                    </fieldset>
		    	</div>
		    </div>
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

    addEventListeners() {
        const script = document.createElement('script')
        const appcontainer = document.querySelector('div#app')
        
        script.src = 'static/scripts/pong/dist/main.js'
        
        appcontainer.appendChild(script)
    }
}