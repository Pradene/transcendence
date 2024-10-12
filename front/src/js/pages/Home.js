import { TemplateComponent } from "../utils/TemplateComponent.js"
import {Router} from "../utils/Router.js"

export class Home extends TemplateComponent {
    constructor() {
        super()
    }

    async unmount() {}

    async componentDidMount() {
        const router = Router.get()
        
        const GameButton = document.querySelector("button.create-game");
        const TournamentButton = document.querySelector("button.create-tournament")
        
        TournamentButton.addEventListener("click", async () => {
            await router.navigate('/matchmaking/')
        })
        
        GameButton.addEventListener("click", async () => {
            await router.navigate('/matchmaking/')
        })
    }
}
