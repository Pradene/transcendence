import { TemplateComponent } from '../utils/TemplateComponent.js'
import {Router} from '../utils/Router.js'
import { WSManager } from '../utils/WebSocketManager.js'

export class Home extends TemplateComponent {
    constructor() {
        super()

        this.translations = {
            en: {
                online_game_title: "Online game",
                online_game_desc: "Play an online game versus another player, first player to 5 points will win the game.",
                tournament_title: "Online tournament",
                tournament_desc: "Play in an online tournament, versus 3 other players.",
                local_game_title: "Local game",
                local_game_desc: "Play a local game against a friend, first player uses arrow keys, second one use A/D.",
                play_button: "Play",
                waitmessage: "Waiting for other players",
                cancel_btn: "Cancel"
            },
            de: {
                online_game_title: "Online-Spiel",
                online_game_desc: "Spielen Sie ein Online-Spiel gegen einen anderen Spieler,<br>der erste Spieler mit 5 Punkten gewinnt das Spiel.",
                tournament_title: "Online-Turnier",
                tournament_desc: "Spielen Sie in einem Online-Turnier gegen 3 andere Spieler.",
                local_game_title: "Lokales Spiel",
                local_game_desc: "Spielen Sie ein lokales Spiel gegen einen Freund, der erste Spieler benutzt<br>die Pfeiltasten, der zweite A/D.",
                play_button: "Spielen",
                waitmessage: "Warten auf andere Spieler",
                cancel_btn: "Stornieren"
            },
            fr: {
                online_game_title: "Jeu en ligne",
                online_game_desc: "Jouez une partie en ligne contre un autre joueur, le premier a 5 points remporte la partie.",
                tournament_title: "Tournoi en ligne",
                tournament_desc: "Jouez dans un tournoi en ligne, contre 3 autre joueurs.",
                local_game_title: "Jeu local",
                local_game_desc: "Jouez une partie locale contre un ami, le premier utilise les fleches, le second Q/D.",
                play_button: "Jouer",
                waitmessage: "En attente d'autres joueurs",
                cancel_btn: "Annuler"
            }
        }
        this.currentLanguage = localStorage.getItem('selectedLanguage') || "en";
        console.log(this.currentLanguage);
    }

    async unmount() {
        WSManager.remove('matchmaking')
    }

    async componentDidMount() {
        const localGameButton = document.querySelector('button.create-local')
        const gameButton = document.querySelector('button.create-game')
        const tournamentButton = document.querySelector('button.create-tournament')
        const cancelButton = document.querySelector('#cancel-matchmaking')

        tournamentButton.addEventListener('click', async () => this.matchmaking('tournament'))

        gameButton.addEventListener('click', async () => this.matchmaking('game'))

        localGameButton.addEventListener('click', async () => await this.localGame())

        cancelButton.addEventListener('click', () => this.cancelMatchmaking())
        this.translatePage()
    }

    translatePage() {
        console.log(this.currentLanguage);

        const elements = document.querySelectorAll("[data-translate-key]");
        elements.forEach(el => {
            const key = el.dataset.translateKey;
            el.textContent = this.translations[this.currentLanguage][key];
        });
    }

    matchmaking(type) {
        if (!type) return

        this.showLoadingScreen()

        const url = `wss://${location.hostname}:${location.port}/ws/matchmaking/${type}/`
        const socket = new WebSocket(url)

        socket.onmessage = async (e) => {
            await this.handleMessage(e)
        }

        WSManager.add('matchmaking', socket)
    }

    async localGame() {
        console.log('local game')
        const router = Router.get()
        await router.navigate('/local/')
    }

    cancelMatchmaking() {
        WSManager.remove('matchmaking')
        this.removeLoadingScreen()
    }

    async handleMessage(e) {
        const data = JSON.parse(e.data)
        const router = Router.get()

        if (data.type == 'game_found') {
            const id = data.game_id
            await router.navigate(`/game/${id}/`)

        } else if (data.type === 'tournament_found') {
            const id = data.tournament_id
            await router.navigate(`/tournament/${id}/`)
        }
    }

    showLoadingScreen() {
        const loadingScreen = document.querySelector('.loading-screen')
        loadingScreen.classList.add('active')
    }

    removeLoadingScreen() {
        const loadingScreen = document.querySelector('.loading-screen')
        loadingScreen.classList.remove('active')
    }
}
