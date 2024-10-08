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
        const games = document.querySelectorAll(".game-list .game")

        games.forEach((game, index) => {
            const user1 = game.querySelector(".user1")
            const user2 = game.querySelector(".user2")
            const user1score = game.querySelector(".user1-score")
            const user2score = game.querySelector(".user2-score")
            const data = gameinfo.data[index]

            user1.textContent = data[0][0]
            user2.textContent = data[1][0]
            user1score.textContent = data[0][1]
            user2score.textContent = data[1][1]
        })
    }

    displayNotFound() {
        document.querySelector(".gameview").classList.add("not-found")
    }

    getGameID() {
        return location.pathname.split("/")[2]
    }
}