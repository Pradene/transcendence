import { TemplateComponent } from "../utils/TemplateComponent.js"
import { registerTemplates } from "../utils/Templates.js"
import { getURL, apiRequest, getUserID } from "../utils/utils.js"
import { ProfileButton } from "./ProfileButton.js"
import { GameComponent } from "./GameComponent.js"

export class Profile extends TemplateComponent {
    constructor() {
        super()
    }

    async componentDidMount() {
        await this.getUser()
        await this.getGames()
    }

    async getUser() {
        try {
            const id = this.getProfileID()
            const url = getURL(`api/users/${id}/`)
            
            const user = await apiRequest(url)

            const picture = this.getRef("profilePicture")
            const username = this.getRef("profileUsername")
            const button = this.getRef("profileButton")

            picture.src = user.picture
            username.textContent = user.username

            const Button = new ProfileButton()
            const component = await Button.render(user.status)

            button.appendChild(component)

        } catch (error) {
            console.log(error)
        }
    }

    getProfileID() {
        return location.pathname.split("/")[2]
    }

    async getGames() {
        try {
            // const id = this.getProfileID()
            const url = getURL("api/games/")
            const games = await apiRequest(url)

            const container = this.getRef("games")
            games.forEach(game => {
                const Game = new GameComponent()
                const component = Game.render(game)

                container.appendChild(component)
            })
            
        } catch (e) {
            return
        }
    }
}

registerTemplates("Profile", Profile)