import { TemplateComponent } from "../utils/TemplateComponent.js"
import { getURL, apiRequest, getConnectedUserID } from "../utils/utils.js"
import { Session } from "../utils/Session.js"
import { disconnect } from "process"
import {Router} from "../utils/Router";

export class Profile extends TemplateComponent {
    constructor() {
        super()

        this.translations = {
            en: {
                editProfile: "Edit profile",
                disconnect: "Disconnect",
                won: "Won",
                lost: "Lost",
                games: "games",
                wins: "wins",
                loses: "loses",
                winrate: "winrate",
                level: "Level"
            },
            fr: {
                editProfile: "Modifier le profil",
                disconnect: "Se deconnecter",
                won: "Gagné",
                lost: "Perdu",
                games: "parties",
                wins: "victoires",
                loses: "défaites",
                winrate: "Taux de victoire",
                level: "Niveau"
            },
            de: {
                editProfile: "Profil bearbeiten",
                disconnect: "Abziehen",
                won: "Gewonnen",
                lost: "Verloren",
                games: "Spiele",
                wins: "Siege",
                loses: "Niederlagen",
                winrate: "Gewinnrate",
                level: "Stufe"
            }
        }
    }

    async unmount() {}

    async componentDidMount() {
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
        await this.getUser()
        await this.getLevel()
        await this.getGames()
        await this.getStats()
        this.translatePage()
    }

    translatePage() {

        const elements = document.querySelectorAll('[data-translation-key]');

        elements.forEach(element => {
            const translationKey = element.getAttribute('data-translation-key');

            if (this.translations[this.currentLanguage] && this.translations[this.currentLanguage][translationKey]) {
                element.textContent = this.translations[this.currentLanguage][translationKey];
            }
        });
        const levelText = document.querySelector('.level > div:first-child')
        if (levelText) levelText.firstChild.nodeValue = this.translations[this.currentLanguage].level + ' '

        const gamesLabel = document.querySelector('#games + p')
        if (gamesLabel) gamesLabel.textContent = this.translations[this.currentLanguage].games

        const winsLabel = document.querySelector('#wins + p')
        if (winsLabel) winsLabel.textContent = this.translations[this.currentLanguage].wins

        const losesLabel = document.querySelector('#loses + p')
        if (losesLabel) losesLabel.textContent = this.translations[this.currentLanguage].loses

        const editButton = document.querySelector("a.button")
        if (editButton) editButton.textContent = this.translations[this.currentLanguage].editProfile
        const logoutButton = document.querySelector("logout-button button");
        if (logoutButton) {
            logoutButton.textContent = this.translations[this.currentLanguage].disconnect;
        }
    }

    async getUser() {
        try {
            const id = this.getProfileID()
            const url = getURL(`api/users/${id}/`)

            const user = await apiRequest(url)

            const picture = document.getElementById("profile-picture")
            const username = document.getElementById("username")
            const buttonContainer = document.getElementById("profile-button")

            picture.src = user.picture
            username.textContent = user.username

            if (id == Session.getUserID()) {
                const logoutButton = document.createElement("logout-button")
                buttonContainer.appendChild(logoutButton)

                const editBtton = document.createElement("a")
                editBtton.href = `/users/${Session.getUserID()}/edit/`
                editBtton.dataset.link = ""
                editBtton.textContent = "Edit profile"
                editBtton.classList.add('button')
                buttonContainer.appendChild(editBtton)

            } else {
                const button = document.createElement("friend-button")
                button.status = user.status
                button.id = user.id
                buttonContainer.appendChild(button)
            }

        } catch (error) {
            const router = Router.get()
            await router.navigate('/404')
        }
    }

    async getLevel() {
        const req = await fetch(`/api/users/levelinfo/${this.getProfileID()}`)
        const data = await req.json()

        const level_element = document.querySelector(".level #level")
        const xp_element = document.querySelector(".level #exp")
        const xpmax_element = document.querySelector(".level #expMax")
        const progress_element = document.querySelector(".information progress")

        level_element.textContent = data.level
        xp_element.textContent = data.xp
        xpmax_element.textContent = data.requiredxp

        progress_element.setAttribute("max", data.requiredxp)
        progress_element.setAttribute("value", data.xp)
    }

    getProfileID() {
        return location.pathname.split("/")[2]
    }

    async getGames() {
        try {
            const url = getURL("api/games/history/")
            const games = await apiRequest(url)

            const container = document.getElementById("games-history")
            console.log(games)

            games.forEach((game) => {
				console.log('hello')
                if (game.status === "finished" && game.tournament === null) {
                    const element = this.displayGame(game)
                    container.appendChild(element)
                }
            })

        } catch (e) {
			console.log(e)
            return
        }
    }

    displayGame(game) {
        const element = document.createElement('game-min')
        element.setAttribute('gameid', game.id)

        return element
    }

    displayTournament(game) {
        const element = document.createElement('div')
        element.classList.add('game', 'tournament')
        element.addEventListener('click', (event) => {
            document.location = "/tournament/" + game.id
        })

        const player = document.createElement('div')
        player.classList.add('player')
        const playerImgContainer = document.createElement('div')
        playerImgContainer.classList.add('profile-picture')
        const playerImg = document.createElement('img')
        playerImg.src = game.winner.picture
        const playerUsername = document.createElement('p')
        playerUsername.textContent = game.winner.username

        const won = document.createElement('p')
        won.textContent = game.winner.id == this.getProfileID() ? "Won" : "Lost"

        playerImgContainer.appendChild(playerImg)
        player.appendChild(playerImgContainer)
        player.appendChild(playerUsername)

        element.appendChild(player)
        element.appendChild(won)

        return element
    }

    async getStats() {
        try {
            const url = getURL("api/games/stats/")
            const data = await apiRequest(url)

            this.displayStats(data)

        } catch (e) {
            console.log(e)
            return
        }
    }

    displayStats(stats) {
        const games = stats.total_games
        const wins = stats.wins
        const loses = stats.loses

        let winrate = 0
        if (games !== 0) {
            winrate = wins / games
        }

        const progress = document.getElementById('winrate-wins')
        progress.style.strokeDashoffset = 198 * (1 - winrate)

        const winrateText = document.getElementById('winrate')
        this.animateNumber(winrateText, winrate * 100, 1000)

        const gamesText = document.getElementById('games')
        this.animateNumber(gamesText, games, 200)

        const winsText = document.getElementById('wins')
        this.animateNumber(winsText, wins, 200)

        const losesText = document.getElementById('loses')
        this.animateNumber(losesText, loses, 200)
    }

    animateNumber(element, value, time) {
        const startValue = 0
        const startTime = performance.now()

        function update() {
            const currentTime = performance.now()
            const elapsedTime =  currentTime - startTime
            const progress = Math.min(elapsedTime / time, 1)

            const currentValue = Math.floor(startValue + (value - startValue) * progress)
            element.textContent = currentValue

            if (progress < 1) {
                requestAnimationFrame(update)
            }
        }

        update()
    }
}
