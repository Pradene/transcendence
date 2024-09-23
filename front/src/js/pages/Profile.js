import { TemplateComponent } from "../utils/TemplateComponent.js"
import { getURL, apiRequest, getConnectedUserID } from "../utils/utils.js"
import { GameComponent } from "./GameComponent.js"

export class Profile extends TemplateComponent {
    constructor() {
        super()
    }

    unmount() {}

    async componentDidMount() {
        await this.getUser()
        await this.getGames()
    }

    async getUser() {
        try {
            const id = this.getProfileID()
            const url = getURL(`api/users/${id}/`)
            
            const user = await apiRequest(url)

            console.log(user)

            const picture = this.getRef("profilePicture")
            const username = this.getRef("profileUsername")
            const buttonContainer = this.getRef("profileButton")

            picture.src = user.picture
            username.textContent = user.username

            if (id == getConnectedUserID()) {
                const logoutButton = document.createElement("logout-button")
                buttonContainer.appendChild(logoutButton)

                const editBtton = document.createElement("a")
                editBtton.href = `/users/${getConnectedUserID()}/edit/`
                editBtton.dataset.link = ""
                editBtton.textContent = "Edit profile"
                editBtton.className = "btn btn-primary"
                buttonContainer.appendChild(editBtton)

            } else {
                const button = document.createElement("friend-button")
                button.status = user.status
                button.id = user.id
                buttonContainer.appendChild(button)
            }

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
