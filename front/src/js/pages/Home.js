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
        window.addEventListener("gameMessage", (e) => this.handleGameSocketMessage(e.detail.data))

        const createTournamentButton = document.querySelector("button.create-tournament")
        createTournamentButton.addEventListener("click", () => {
            this._gameSocket.requestJoinTournamentQueue()
        })

        const createGameButton = document.querySelector("button.create-game");
        createGameButton.addEventListener("click", () => {
            this._gameSocket.requestJoinGameQueue()
        })
    }

    async handleGameSocketMessage(response) {
        const gameContainer = document.querySelector(".game-canvas")

        switch (response.method) {
            case "get_users":
                // this._gameSocket.processGetUsers(response);
                break;
            case "join_game":
                // this.hideQueueAnimation();
                this._gameSocket.createNewGame(response);
                break;
            case "join_queue":
                // this.showQueueAnimation();
                break;
            case "update_game":
                // this.hideQueueAnimation();
                if (!this._gameSocket._currentGame)
                    this._gameSocket._currentGame = new Pong(gameContainer);

                this._gameSocket._currentGame.update(response);
                break;
            case "redirect_game":
                const gameid = response.gameid
                await Router.get().navigate(`/game/${gameid}`)
                break;
        }
    }

    showQueueAnimation() {
        document.querySelector("div.game-container-header div.waiting-for-players").style.visibility = "visible";
    }

    hideQueueAnimation() {
        document.querySelector("div.game-container-header div.waiting-for-players").style.visibility = "hidden";
    }
}
