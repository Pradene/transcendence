import {TemplateComponent} from '../utils/TemplateComponent.js'
import {connectTournamentSocket} from '../websockets/Tournament.js'

export class Tournament extends TemplateComponent {
    constructor() {
        super()
    }

    unmount() {

    }

    async componentDidMount() {
        const id = this.getTournamentID()

        // Check if the tournament running or finished
        const response = await fetch(`/api/games/tournamentinfo/${id}`)

        // tournament not found, connect to socket
        if (response.status === 404) {
            const socket = connectTournamentSocket(id)
        } else {
            const data = await response.json()
            await this.displayTournament(data)
        }
    }

    getTournamentID() {
        return location.pathname.split('/')[2]
    }

    async displayTournament(data) {
        const container = document.querySelector('.stat.tournament')

        const winner = document.createElement('user-profile')
        const g1 = document.createElement('game-min')
        const g2 = document.createElement('game-min')
        const g3 = document.createElement('game-min')

        winner.style.gridArea = 'winner'

        g1.style.gridArea = 'g1'
        g2.style.gridArea = 'g2'
        g3.style.gridArea = 'g3'

        g1.setAttribute('gameid', data.games[0].id)
        g2.setAttribute('gameid', data.games[1].id)
        g3.setAttribute('gameid', data.games[2].id)

        container.appendChild(winner)
        container.appendChild(g1)
        container.appendChild(g2)
        container.appendChild(g3)
    }
}