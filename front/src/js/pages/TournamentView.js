import {TemplateComponent} from "../utils/TemplateComponent";

export class TournamentView extends TemplateComponent {
    constructor() {
        super();
    }

    async componentDidMount() {
        const gameinfo = await (await fetch(`/api/games/tournamentinfo/${this.getGameID()}`)).json()
        console.log(gameinfo)

        if (gameinfo.exists === false)
            this.displayNotFound()

        const winner = gameinfo.winner
        const user1 = gameinfo.data[0]
        const user2 = gameinfo.data[1]

        const header = document.querySelector("h1.players")
        const winnerelement = document.querySelector("h2.winner")
        const gamelist = document.querySelector(".game-list")

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