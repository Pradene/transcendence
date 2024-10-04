import { TemplateComponent } from "../utils/TemplateComponent.js"
import { getURL, apiRequest, getConnectedUserID } from "../utils/utils.js"

export class Profile extends TemplateComponent {
    constructor() {
        super()
    }

    unmount() {}

    async componentDidMount() {
        await this.getUser()
        await this.getLevel()
        await this.getGames()
        await this.getStats()
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

            if (id == getConnectedUserID()) {
                const logoutButton = document.createElement("logout-button")
                buttonContainer.appendChild(logoutButton)

                const editBtton = document.createElement("a")
                editBtton.href = `/users/${getConnectedUserID()}/edit/`
                editBtton.dataset.link = ""
                editBtton.textContent = "Edit profile"
                editBtton.classList.add('button')
                buttonContainer.appendChild(editBtton)

            } else {
                const button = document.createElement("friend-button")
                button.classList.add('button')
                button.status = user.status
                button.id = user.id
                buttonContainer.appendChild(button)
            }

        } catch (error) {
            console.log(error)
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
        element.classList.add('game')
        element.addEventListener('click', (event) => {
            document.location = "/game/" + game.id
        })

        const player = document.createElement('div')
        player.classList.add('player')
        const playerImgContainer = document.createElement('div')
        playerImgContainer.classList.add('profile-picture')
        const playerImg = document.createElement('img')
        playerImg.src = game.player.picture
        const playerUsername = document.createElement('p')
        playerUsername.textContent = game.player.username
        
        const opponent = document.createElement('div')
        opponent.classList.add('player', 'end')
        const opponentImgContainer = document.createElement('div')
        opponentImgContainer.classList.add('profile-picture')
        const opponentImg = document.createElement('img')
        opponentImg.src = game.opponent.picture
        const opponentUsername = document.createElement('p')
        opponentUsername.textContent = game.opponent.username

        const score = document.createElement('div')
        score.textContent = `${game.player_score} vs ${game.opponent_score}`

        playerImgContainer.appendChild(playerImg)
        player.appendChild(playerImgContainer)
        player.appendChild(playerUsername)

        opponent.appendChild(opponentUsername)
        opponentImgContainer.appendChild(opponentImg)
        opponent.appendChild(opponentImgContainer)

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
