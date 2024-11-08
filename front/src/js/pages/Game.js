import { TemplateComponent } from "../utils/TemplateComponent"
import { Pong } from "../pong/Pong"
import { WSManager } from "../utils/WebSocketManager"

export class Game extends TemplateComponent {
    constructor() {
        super()

        this.game = undefined
        this.socket = undefined

        this.removeGame = () => this.game?.end()
    }

    async unmount() {
        WSManager.remove('game')

        if (this.game)
            this.game.end()

        window.removeEventListener('beforeunload', this.removeGame)
    }

    async componentDidMount() {
        const id = this.getGameID()
        this.game = new Pong(id)

        window.addEventListener('beforeunload', this.removeGame)
    }

    getGameID() {
        return location.pathname.split("/")[2]
    }
}