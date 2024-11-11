import { TemplateComponent } from "../utils/TemplateComponent"
import { Pong } from "../pong/Pong"
import { WSManager } from "../utils/WebSocketManager"

export class LocalGame extends TemplateComponent {
    constructor() {
        super()

        this.game = undefined
    }

    async unmount() {
        WSManager.remove('game')

        if (this.game)
            this.game.end()
    }

    async componentDidMount() {
        this.game = new Pong(0, true)
    }

    getGameID() {
        return location.pathname.split("/")[2]
    }
}