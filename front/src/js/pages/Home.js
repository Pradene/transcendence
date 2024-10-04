import { TemplateComponent } from "../utils/TemplateComponent.js"
import { GameSocket } from "../pong/GameSocket.js"
import { Pong } from "../pong/Pong.js"
import {Router} from "../utils/Router";

export class Home extends TemplateComponent {
    constructor() {
        super()
        
        this._gameSocket = null
    }

    unmount() {
        this._gameSocket?.close()
        console.log("Unmouting home page")
    }

    async componentDidMount() {
        this._gameSocket = await GameSocket.get()
        window.addEventListener("joinQueue", (e) => this.showQueueAnimation())
        window.addEventListener("leaveQueue", (e) => this.hideQueueAnimation())

        const createTournamentButton = document.querySelector("button.create-tournament")
        createTournamentButton.addEventListener("click", () => {
            this._gameSocket.requestJoinTournamentQueue()
        })

        const createGameButton = document.querySelector("button.create-game");
        createGameButton.addEventListener("click", () => {
            this._gameSocket.requestJoinGameQueue()
        })
    }

    // async handleGameSocketMessage(response) {
    //
    // }

    showQueueAnimation() {
        document.querySelector("div.game-container-header div.waiting-for-players").style.visibility = "visible";
    }

    hideQueueAnimation() {
        document.querySelector("div.game-container-header div.waiting-for-players").style.visibility = "hidden";
    }
}
