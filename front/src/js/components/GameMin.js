import {Session} from "../utils/Session"

class GameMin extends HTMLElement {
    constructor() {
        super()
    }

    async connectedCallback() {
        if (this.classList.contains('tournament')) {
            await this.tournamentCallback()
            return
        }

        const userID       = Session.getUserID()
        const gameid       = this.getAttribute('gameid')
        const istournament = this.getAttribute('istournament')
        const response     = await fetch(`/api/games/gameinfo/${gameid}`)
        const exists       = response.status !== 404
        let data           = exists ? await response.json() : {
            players: [
                {
                    id: null,
                    score: 0
                },
                {
                    id: null,
                    score: 0
                }
            ]
        }

        if (data.players.length < 2) {
            data = {
                players: [
                    {
                        id: data.participants[0].id,
                        score: 0
                    },
                    {
                        id: data.participants[1].id,
                        score: 0
                    }
                ]
            }
        }

        const user1 = data.players[0]
        const user2 = data.players[1]

        const userid         = user1.id === userID ? user1.id : user2.id
        const opponentid     = user1.id === userID ? user2.id : user1.id
        const user_score     = userid === user1.id ? user1.score : user2.score
        const opponent_score = userid === user1.id ? user2.score : user1.score

        this.addEventListener('click', (event) => {
            document.location = "/game/" + data.id
        })

        const player = document.createElement('user-profile')
        player.setAttribute('userid', userid)

        const opponent = document.createElement('user-profile')
        opponent.setAttribute('userid', opponentid)
        opponent.classList.add('end')

        const score       = document.createElement('div')
        score.textContent = `${user_score} vs ${opponent_score}`
        // playerImgContainer.appendChild(playerImg)
        // player.appendChild(playerImgContainer)

        // player.appendChild(playerUsername)
        this.appendChild(player)
        this.appendChild(score)
        this.appendChild(opponent)
    }

    async tournamentCallback() {
        const userID = Session.getUserID()

        const tournamentid = this.getAttribute('gameid')
        const data         = await (await fetch(`/api/games/tournamentinfo/${tournamentid}`)).json()

        const player = document.createElement('user-profile')
        player.setAttribute('playerid', userID)

        const won          = userID == data.winner.id
        const result       = document.createElement('p')
        result.textContent = won ? 'You won' : 'You lost'

        this.appendChild(player)
        this.appendChild(result)

        this.addEventListener('click', (event) => {
            document.location = "/tournament/" + data.id
        })
    }
}

customElements.define('game-min', GameMin)