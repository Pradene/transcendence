import { TemplateComponent } from "../utils/TemplateComponent"
import { Pong } from "../pong/Pong"
import { WSManager } from "../utils/WebSocketManager"

export class Game extends TemplateComponent {
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
        const id = this.getGameID()
        this.game = new Pong(id)
        this.translateLeaveBtn()
    }

    translateLeaveBtn() {
        const currentLanguage = localStorage.getItem('selectedLanguage') || "en";
        const translations = { de: "Spiel Verlassen", en: "Leave Game", fr: "Quitter le jeu" }
        const leaveBtn = document.getElementById('leave-game')
        leaveBtn.innerHTML = translations[currentLanguage]
    }

    getGameID() {
        return location.pathname.split("/")[2]
    }
}
