import {TemplateComponent} from "../utils/TemplateComponent";

export class TournamentView extends TemplateComponent {
    constructor() {
        super();
    }

    async componentDidMount() {
        const gameinfo = await (await fetch(`/api/games/tournamentinfo/${this.getGameID()}`)).json()
        if (gameinfo.exists === false)
            this.displayNotFound()

        const winner = gameinfo.winner
        const user1 = gameinfo.data[0]
        const user2 = gameinfo.data[1]

        console.log(gameinfo)
        console.log(winner)
        const winnerElement = document.createElement("user-profile")
        winnerElement.setAttribute("playerid", winner.id)

        const gamelist = document.querySelector(".game-list")
        document.querySelector(".gameview .stat").insertBefore(winnerElement, gamelist)
        gameinfo.data.forEach((game) => {
            const element = document.createElement("game-min")
            element.setAttribute("gameid", game.id)
            gamelist.appendChild(element)
        })
    }

    displayNotFound() {
        document.querySelector(".gameview").classList.add("not-found")
    }

    getGameID() {
        return location.pathname.split("/")[2]
    }
}