/* import { TemplateComponent } from "../utils/TemplateComponent.js"
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

        const createLocalButton = document.querySelector("button.create-local")
        createLocalButton.addEventListener("click", () => {
            this._gameSocket.requestLocalGame()
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
 */

import { TemplateComponent } from "../utils/TemplateComponent.js"
import { GameSocket } from "../pong/GameSocket.js"
import { Pong } from "../pong/Pong.js"
import {Router} from "../utils/Router";

export class Home extends TemplateComponent {
    constructor() {
        super()

        this._gameSocket = null
        this.translations = {
            en: {
                online_game_title: "Online game",
                online_game_desc: "Play an online game versus another player, first player to 5 points will win the game.",
                tournament_title: "Online tournament",
                tournament_desc: "Play in an online tournament, versus 3 other players.",
                local_game_title: "Local game",
                local_game_desc: "Play a local game against a friend, first player uses arrow keys, second one use A/D.",
                play_button: "Play",
                score_title: "Score:"
            },
            de: {
                online_game_title: "Online-Spiel",
                online_game_desc: "Spielen Sie ein Online-Spiel gegen einen anderen Spieler,<br>der erste Spieler mit 5 Punkten gewinnt das Spiel.",
                tournament_title: "Online-Turnier",
                tournament_desc: "Spielen Sie in einem Online-Turnier gegen 3 andere Spieler.",
                local_game_title: "Lokales Spiel",
                local_game_desc: "Spielen Sie ein lokales Spiel gegen einen Freund, der erste Spieler benutzt<br>die Pfeiltasten, der zweite A/D.",
                play_button: "Spielen",
                score_title: "Punktestand:"
            },
            fr: {
                online_game_title: "Jeu en ligne",
                online_game_desc: "Jouez une partie en ligne contre un autre joueur, le premier a 5 points remporte la partie.",
                tournament_title: "Tournois en ligne",
                tournament_desc: "Jouez dans un tournoi en ligne, contre 3 autre joueurs.",
                local_game_title: "Jeu local",
                local_game_desc: "Jouez une partie locale contre un ami, le premier utilise les fleches, le second Q/D.",
                play_button: "Jouer",
                score_title: "Score:"
            }
        }
        this.currentLanguage = localStorage.getItem('selectedLanguage') || "en";
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

        const createLocalButton = document.querySelector("button.create-local")
        createLocalButton.addEventListener("click", () => {
            this._gameSocket.requestLocalGame()
        })

        this.setupLanguageButtons();
        this.translatePage();
    }

    setupLanguageButtons() {
        document.querySelectorAll(".lang-button").forEach(button => {
            button.addEventListener("click", (e) => {
                this.currentLanguage = e.target.dataset.lang;
                localStorage.setItem('selectedLanguage', this.currentLanguage);
                this.translatePage();
            });
        });
    }

    translatePage() {
        const elements = document.querySelectorAll("[data-translate-key]");
        elements.forEach(el => {
            const key = el.dataset.translateKey;
            el.innerHTML = this.translations[this.currentLanguage][key];
        });
    }

    showQueueAnimation() {
        document.querySelector("div.game-container-header div.waiting-for-players").style.visibility = "visible";
    }

    hideQueueAnimation() {
        document.querySelector("div.game-container-header div.waiting-for-players").style.visibility = "hidden";
    }
}
