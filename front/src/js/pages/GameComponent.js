import { TemplateComponent } from "../utils/TemplateComponent.js"

export class GameComponent extends TemplateComponent {
    constructor() {
        super()
    }

    async render(game) {
        await this.parseTemplate()
        await this.componentDidMount(game)

        return this.container
    }

    async componentDidMount(game) {
        console.log(game)

        const playerScore = this.getRef("playerScore")
        const playerUsername = this.getRef("playerUsername")
        const playerPicture = this.getRef("playerPicture")

        const opponentScore = this.getRef("opponentScore")
        const opponentUsername = this.getRef("opponentUsername")
        const opponentPicture = this.getRef("opponentPicture")
    }
}
