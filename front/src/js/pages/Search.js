import { TemplateComponent } from "../utils/TemplateComponent.js"
import { getURL, apiRequest, getConnectedUserID } from "../utils/utils.js"
import { WebSocketManager } from "../utils/WebSocketManager.js"

export class Search extends TemplateComponent {
    constructor() {
        super()

        this.searchUserListener = (e) => this.searchUser(e.target.value)
        this.WebsocketMessageListener = (e) => this.WebsocketMessage(e)
    }

    unmount() {
        const input = this.getRef("input")
        input.removeEventListener("input", this.searchUserListener)
    
        window.removeEventListener('wsMessage', this.WebsocketMessageListener)
    }

    async componentDidMount() {
        this.getFriends()

        const input = this.getRef("input")
        input.addEventListener("input", this.searchUserListener)

        window.addEventListener('wsMessage', this.WebsocketMessageListener)
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

        const status = document.createElement("span")
        status.className = user.is_active ? "online" : ""

        const name = document.createElement("div")
        name.className = "name"
        name.textContent = user.username

        imgContainer.appendChild(img)
        imgContainer.appendChild(status)
        link.appendChild(imgContainer)
        link.appendChild(name)
        element.appendChild(link)

        return element
    }

    WebsocketMessage(e) {
        console.log(e)
    }

    async getFriends() {
        try {
            const id = getConnectedUserID()
            const url = getURL(`api/users/${id}/friends/`)
            const friends = await apiRequest(url)

            const container = this.getRef('friends')
            friends.forEach(friend => {
                const element = this.displayUser(friend)
                container.appendChild(element)
            })

        } catch (e) {
            console.log(e)
        }
    }

}
