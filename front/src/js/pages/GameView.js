import {TemplateComponent} from "../utils/TemplateComponent";

export class GameView extends TemplateComponent {
    constructor() {
        super();
    }

    async componentDidMount() {
        const gameinfo = await (await fetch(`/api/games/gameinfo/${this.getGameID()}`)).json()
        console.log(gameinfo)

        if (gameinfo.exists === false)
            this.displayNotFound()

        const winner = gameinfo.winner
        const user1 = gameinfo.data[0]
        const user2 = gameinfo.data[1]

        const header = document.querySelector("h1.players")
        const winnerelement = document.querySelector("h2.winner")
        const user1name = document.querySelector(".p1 .username")
        const user1score = document.querySelector(".p1 .score")
        const user2name = document.querySelector(".p2 .username")
        const user2score = document.querySelector(".p2 .score")

        header.textContent = `${user1[0]} VS ${user2[0]}`
        winnerelement.textContent = `WINNER: ${winner}`
        user1name.textContent = user1[0]
        user2name.textContent = user2[0]
        user1score.textContent = user1[1]
        user2score.textContent = user2[1]

    }

    displayNotFound() {
        document.querySelector(".gameview").classList.add("not-found")
    }

    getGameID() {
        return location.pathname.split("/")[2]
    }
}