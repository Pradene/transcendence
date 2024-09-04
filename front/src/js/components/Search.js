import { TemplateComponent } from "../utils/TemplateComponent.js"
import { registerTemplates } from "../utils/Templates.js"
import { getURL, apiRequest } from "../utils/utils.js"
import { UserComponent } from "./UserComponent.js"

export class Search extends TemplateComponent {
    constructor() {
        super()
    }

    async componentDidMount() {
        const input = this.getRef("input")
        input.addEventListener(
            "input",
            (event) => this.searchUser(event.target.value)
        )
    }

    // Searching users
    async searchUser(query) {
        try {
            const container = this.getRef("users")
            container.replaceChildren()
            
            if (!query) return

            const url = getURL(`api/users/search/?q=${query}`)
            const users = await apiRequest(url)

            users.forEach(async (user) => {
                const userComponent = new UserComponent()
                const fragment = await userComponent.render(user)

                container.appendChild(fragment)
            })

        } catch (error) {
            console.log(error)
        }
    }

}

registerTemplates("Search", Search)