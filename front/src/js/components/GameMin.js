import {getConnectedUserID} from "../utils/utils";

class GameMin extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        if (this.classList.contains('tournament')) {
            await this.tournamentCallback()
            return
        }

        const gameid = this.getAttribute('gameid')
        const data = await (await fetch(`/api/games/gameinfo/${gameid}`)).json()

        this.addEventListener('click', (event) => {
            document.location = "/game/" + data.id
        })

        const player = document.createElement('user-profile')
        player.setAttribute('playerid', data.player.id)

        const opponent = document.createElement('user-profile')
        opponent.setAttribute('playerid', data.opponent.id)
        opponent.classList.add('end')

        const score = document.createElement('div')
        score.textContent = `${data.player_score} vs ${data.opponent_score}`
        // playerImgContainer.appendChild(playerImg)
        // player.appendChild(playerImgContainer)

        // player.appendChild(playerUsername)
        this.appendChild(player)
        this.appendChild(score)
        this.appendChild(opponent)
    }

    async tournamentCallback() {
        const tournamentid = this.getAttribute('gameid')
        const data = await (await fetch(`/api/games/tournamentinfo/${tournamentid}`)).json()

        const player = document.createElement('user-profile')
        player.setAttribute('playerid', data.winner.id)

        const won = getConnectedUserID() == data.winner.id
        const result = document.createElement('p')
        result.textContent = won ? 'You won' : 'You lost'

        this.appendChild(player)
        this.appendChild(result)

        this.addEventListener('click', (event) => {
            document.location = "/tournament/" + data.id
        })
    }
}

customElements.define('game-min', GameMin);