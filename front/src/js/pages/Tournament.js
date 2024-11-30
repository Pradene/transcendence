import {TemplateComponent} from '../utils/TemplateComponent.js'
import {connectTournamentSocket} from '../websockets/Tournament.js'

export class Tournament extends TemplateComponent {
    constructor() {
        super()
    }

    unmount() {
        removeEventListener("queryTournament", this.displayTournament)
    }

    async componentDidMount() {
        const id = this.getTournamentID()

        // register listener
        addEventListener("queryTournament", this.displayTournament)

        // tournament not found, connect to socket
        const socket = connectTournamentSocket(id)
        dispatchEvent(new CustomEvent("queryTournament", {detail: id}))
    }

    getTournamentID() {
        return location.pathname.split('/')[2]
    }

    async displayTournament(event) {
        console.log("Querying tournament")

        const id = event.detail
        const response = await fetch(`/api/games/tournamentinfo/${id}/`)
        if (response.status !== 200)
            return

        // get data and container
        const data      = await response.json()
        console.log("tournament data", data)
        const container = document.querySelector('.stat.tournament')

        // create winner element if exists
        const winner    = document.createElement('user-profile')
        winner.style.gridArea = 'winner'
        container.appendChild(winner)

        // create game element if exists
        data.games.forEach((game, i) => {
            const element = document.createElement('game-min')
            element.setAttribute('gameid', game.id)
            element.style.gridArea = `g${i+1}`
            container.appendChild(element)

        })
    }
}