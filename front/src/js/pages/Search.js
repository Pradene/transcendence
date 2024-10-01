import { TemplateComponent } from "../utils/TemplateComponent.js"
import { getURL, apiRequest } from "../utils/utils.js"

export class Search extends TemplateComponent {
    constructor() {
        super()

        this.searchUserListener = (e) => this.searchUser(e.target.value)
    }

    unmount() {
        const input = this.getRef("input")
        input.removeEventListener("input", this.searchUserListener)
    }

    async componentDidMount() {
        const input = this.getRef("input")
        input.addEventListener("input", this.searchUserListener)
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
                const element = this.displayUser(user)
                container.appendChild(element)
            })

        } catch (error) {
            console.log(error)
        }
    }

    displayUser(user) {
        const element = document.createElement("li")
        element.className = "user"

        const link = document.createElement("a")
        link.className = "link"
        link.dataset.link = ""
        link.href = `/users/${user.id}`

        const imgContainer = document.createElement("div")
        imgContainer.className = "profile-picture"

        const img = document.createElement("img")
        img.src = user.picture

        const name = document.createElement("div")
        name.className = "name"
        name.textContent = user.username

        imgContainer.appendChild(img)
        link.appendChild(imgContainer)
        link.appendChild(name)
        element.appendChild(link)

        return element
    }

}
