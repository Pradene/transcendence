import { TemplateComponent } from "../utils/TemplateComponent.js"
import { getURL, apiRequest, getConnectedUserID } from "../utils/utils.js"
import { Chart } from 'chart.js/auto'

export class Profile extends TemplateComponent {
    constructor() {
        super()
    }

    unmount() {}

    async componentDidMount() {
        await this.getUser()
        await this.getGames()
        await this.getStats()
    }

    async getUser() {
        try {
            const id = this.getProfileID()
            const url = getURL(`api/users/${id}/`)
            
            const user = await apiRequest(url)

            const picture = this.getRef("profilePicture")
            const username = this.getRef("profileUsername")
            const buttonContainer = this.getRef("profileButton")

            picture.src = user.picture
            username.textContent = user.username

            if (id == getConnectedUserID()) {
                const logoutButton = document.createElement("logout-button")
                buttonContainer.appendChild(logoutButton)

                const editBtton = document.createElement("a")
                editBtton.href = `/users/${getConnectedUserID()}/edit/`
                editBtton.dataset.link = ""
                editBtton.textContent = "Edit profile"
                editBtton.className = "btn btn-primary"
                buttonContainer.appendChild(editBtton)

            } else {
                const button = document.createElement("friend-button")
                button.status = user.status
                button.id = user.id
                buttonContainer.appendChild(button)
            }

        } catch (error) {
            console.log(error)
        }
    }

    getProfileID() {
        return location.pathname.split("/")[2]
    }

    async getGames() {
        try {
            const url = getURL("api/games/history/")
            const games = await apiRequest(url)

            const container = this.getRef("games")
            games.forEach(game => {
                const element = this.displayGame(game)
                container.appendChild(element)
            })
            
        } catch (e) {
            return
        }
    }

    displayGame(game) {
        const element = document.createElement('div')

        const player = document.createElement('div')
        const playerImgContainer = document.createElement('div')
        const playerImg = document.createElement('img')
        const playerUsername = document.createElement('p')
        playerUsername.textContent = player.username
        
        const opponent = document.createElement('div')
        const opponentImgContainer = document.createElement('div')
        const opponentImg = document.createElement('img')
        const opponentUsername = document.createElement('p')
        opponentUsername.textContent = opponent.username

        const score = document.createElement('div')
        score.textContent = `${game.player_score} vs ${game.opponent_score}`

        player.appendChild(playerUsername)
        opponent.appendChild(opponentUsername)

        element.appendChild(player)
        element.appendChild(score)
        element.appendChild(opponent)

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

        const winrate = wins / games

        const progress = document.getElementById('wins')
        progress.style.strokeDashoffset = 198 * (1 - winrate)

        this.animateWinrate(winrate * 100)
    }

    animateWinrate(winrate) {
        const startValue = 0
        const startTime = performance.now()
        const winrateText = document.getElementById('winrate')
        const time = 1000

        function update() {
            const currentTime = performance.now()
            const elapsedTime =  currentTime - startTime
            const progress = Math.min(elapsedTime / time, 1)

            const currentValue = Math.floor(startValue + (winrate - startValue) * progress)
            winrateText.textContent = `${currentValue}%`
        
            if (progress < 1) {
                requestAnimationFrame(update)
            }
        }

        update()
    }
}
