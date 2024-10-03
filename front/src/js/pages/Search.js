import { TemplateComponent } from "../utils/TemplateComponent.js"
import { getURL, apiRequest, getConnectedUserID } from "../utils/utils.js"
import { WebSocketManager } from "../utils/WebSocketManager.js"

export class Search extends TemplateComponent {
    constructor() {
        super()

        this.searchUserListener = (e) => this.searchUser(e.target.value)
        this.WebsocketMessageListener = (e) => this.WebsocketMessage(e.detail)
        this.handleRequetsListener = (e) => this.handleRequests(e)
    }

    unmount() {
        const input = this.getRef("input")
        input.removeEventListener("input", this.searchUserListener)

        const requests = this.getRef('requests')
        requests.removeEventListener("click", this.handleRequetsListener)
    
        window.removeEventListener('wsMessage', this.WebsocketMessageListener)
    }

    async componentDidMount() {
        this.getFriends()
        this.getRequests()

        const requests = this.getRef('requests')
        requests.addEventListener("click", this.handleRequetsListener)

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
        const message = e.message

        if (!message) return

        if (message.action && message.action === 'friend_request_accepted') {
            const container = this.getRef('friends')
            const element = this.displayUser(message.friend)
            container.appendChild(element)
        
        } else if (message.action && message.action === 'friend_request_received') {
            const container = this.getRef('requests')
            const element = this.displayRequest(message)
            container.appendChild(element)
        }
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

    async getRequests() {
        try {
            const id = getConnectedUserID()
            const url = getURL(`api/users/${id}/friend-requests/`)
            const requests = await apiRequest(url)

            const container = this.getRef('requests')
            requests.forEach(request => {
                const element = this.displayRequest(request)
                container.appendChild(element)
            })

        } catch (e) {
            console.log(e)
        }
    }

    displayRequest(request) {
        console.log(request)

        const element = document.createElement("li")
        element.className = "request"
        element.dataset.id = request.sender.id

        const link = document.createElement("a")
        link.className = "link"
        link.dataset.link = ""
        link.href = `/users/${request.sender.id}/`

        const imgContainer = document.createElement("div")
        imgContainer.className = "profile-picture"

        const img = document.createElement("img")
        img.src = request.sender.picture

        const status = document.createElement("span")
        status.className = request.sender.is_active ? "online" : ""

        const name = document.createElement("div")
        name.className = "name"
        name.textContent = request.sender.username

        const buttons = document.createElement('div')

        const accept = document.createElement('button')
        accept.className = 'button accept'
        accept.textContent = 'Accept'
        
        const decline = document.createElement('button')
        decline.className = 'button decline'
        decline.textContent = 'Decline'

        imgContainer.appendChild(img)
        imgContainer.appendChild(status)
        link.appendChild(imgContainer)
        link.appendChild(name)
        buttons.appendChild(accept)
        buttons.appendChild(decline)
        link.appendChild(buttons)
        element.appendChild(link)

        return element
    }

    handleRequests(e) {
        if (!e.target || !e.target.classList.contains('button'))
            return

        const request = e.target.closest('li')
        const id = request.getAttribute('data-id')
        
        if (e.target.classList.contains('accept')) {
            this.sendAcceptRequest(id)
            request.remove()
            
        } else if (e.target.classList.contains('decline')) {
            this.sendDeclineRequest(id)
            request.remove()
        }
    }

    sendAcceptRequest(id) {
        const ws = WebSocketManager.get()
        ws.sendMessage('friends', {
            'type': 'friend_request_accepted',
            'sender': id
        })
    }

    sendDeclineRequest(id) {
        const ws = WebSocketManager.get()
        ws.sendMessage('friends', {
            'type': 'friend_request_declined',
            'sender': id
        })
    }
}
