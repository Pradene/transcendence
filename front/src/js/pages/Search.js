import { Session } from "../utils/Session.js"
import { TemplateComponent } from "../utils/TemplateComponent.js"
import { getURL, apiRequest, getConnectedUserID } from "../utils/utils.js"
import { WSManager } from "../utils/WebSocketManager.js"

export class Search extends TemplateComponent {
    constructor() {
        super()

        this.searchUserListener = (e) => this.searchUser(e.target.value)
        this.WebsocketMessageListener = (e) => this.WebsocketMessage(e.detail)
        this.handleRequetsListener = (e) => this.handleRequests(e)
    }

    async unmount() {
        const input = this.getRef("input")
        input.removeEventListener("input", this.searchUserListener)

        const requests = this.getRef('requests')
        requests.removeEventListener("click", this.handleRequetsListener)
    
        window.removeEventListener('friendsEvent', this.WebsocketMessageListener)
    }

    async componentDidMount() {
        this.getFriends()
        this.getRequests()

        const requests = this.getRef('requests')
        requests.addEventListener("click", this.handleRequetsListener)

        const input = this.getRef("input")
        input.addEventListener("input", this.searchUserListener)

        window.addEventListener('friendsEvent', this.WebsocketMessageListener)
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
        element.dataset.id = user.id

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
		const message = JSON.parse(e.data)

        if (!message) return

        console.log(message)

        if (message.action && message.action === 'friend_request_accepted') {
            const container = this.getRef('friends')
            const element = this.displayUser(message.user)
            container.appendChild(element)

        } else if (message.action && message.action === 'friend_request_received') {
            const container = this.getRef('requests')
            const element = this.displayRequest(message)
            container.appendChild(element)
        
        } else if (message.action && message.action === 'friend_removed') {
            const container = this.getRef('friends')
            const element = container.querySelector(`[data-id='${message.user.id}']`)
            element.remove()
        
		} else if (message.action && message.action === 'friend_request_cancelled') {
			const container = this.getRef('requests')
			const element = container.querySelector(`[data-id='${message.user.id}']`)
			element.remove()
		}
    }

    async getFriends() {
        try {
            const id = Session.getUserID()
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
            const id = Session.getUserID()
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
        const element = document.createElement("li")
        element.className = "request"
        element.dataset.id = request.user.id

        const link = document.createElement("a")
        link.className = "link"
        link.dataset.link = ""
        link.href = `/users/${request.user.id}/`

        const imgContainer = document.createElement("div")
        imgContainer.className = "profile-picture"

        const img = document.createElement("img")
        img.src = request.user.picture

        const status = document.createElement("span")
        status.className = request.user.is_active ? "online" : ""

        const name = document.createElement("div")
        name.className = "name"
        name.textContent = request.user.username

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
        WSManager.send('friends', {
            'type': 'friend_request_accepted',
            'user_id': id
        })
    }

    sendDeclineRequest(id) {
        WSManager.send('friends', {
            'type': 'friend_request_declined',
            'user_id': id
        })
    }
}
