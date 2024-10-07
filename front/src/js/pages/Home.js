import { TemplateComponent } from "../utils/TemplateComponent.js"
import { GameSocket } from "../pong/GameSocket.js"
import { Pong } from "../pong/Pong.js"
import {Router} from "../utils/Router";

export class Home extends TemplateComponent {
    constructor() {
        super()
    }

    unmount() {}

    async componentDidMount() {
        const router = Router.get()
        
        const GameButton = document.querySelector("button.create-game");
        const TournamentButton = document.querySelector("button.create-tournament")
        
        TournamentButton.addEventListener("click", () => {
            router.navigate('/matchmaking/')
        })
        
        GameButton.addEventListener("click", () => {
            router.navigate('/matchmaking/')
        })
    }
}
