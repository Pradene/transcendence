import { getURL, apiRequest, getConnectedUserID } from "../utils/utils.js"
import { WebSocketManager } from "../utils/WebSocketManager.js"
import { TemplateComponent } from "../utils/TemplateComponent.js"

export class ChatRoom extends TemplateComponent {
    constructor() {
        super()

        this.sendMessageListener = async (e) => this.sendMessage(e) 
        this.WebsocketMessageListener = (e) => this.WebsocketMessage(e.detail) 
    }

    unmount() {
        const form = this.getRef("form")
        form.addEventListener("submit", this.sendMessageListener)
        window.addEventListener("wsMessage", this.WebsocketMessageListener)
    }

    async componentDidMount() {
        await this.getMessages()
        
        const form = this.getRef("form")
        form.addEventListener("submit", this.sendMessageListener)
        window.addEventListener("wsMessage", this.WebsocketMessageListener)
    }

    WebsocketMessage(event) {
        console.log(event)
        const message = event.message

        if (message.action == "message" && message.room_id == this.getRoomID()) {
            const container = this.getRef("messages")
            this.displayMessage(container, message)
        }
    }


    async sendMessage(event) {
        event.preventDefault()

        const input = this.getRef("input")
        const value = input.value
        const roomID = this.getRoomID()

        if (input.value != "") {
            const ws = WebSocketManager.get()
            await ws.sendMessage("chat", {
                type: "message",
                room: roomID,
                content: value
            })

            input.value = ""
        }
    }


    async getMessages() {
        try {
            const roomID = this.getRoomID()
            const url = getURL(`api/chat/rooms/${roomID}/`)
            const data = await apiRequest(url)

            console.log(data)

            const messages = data.messages
            messages.forEach(message => {
                const container = this.getRef("messages")
                this.displayMessage(container, message)
            })

        } catch (error) {
            console.log(error)
        }
    }

    
    displayMessage(container, message) {
        if (!message)
            return

        const element = document.createElement("div")
        
        if (message.user_id == getConnectedUserID())
            element.classList.add("right")


        const imgContainer = document.createElement('a')
        imgContainer.href = `/users/${message.user_id}`
        imgContainer.className = 'profile-picture'
        imgContainer.dataset.link = ''

        const img = document.createElement('img')
        img.src = message.picture
        
        const messageContainer = document.createElement('div')
        messageContainer.className = 'message'

        const messageContent = document.createElement('p')
        messageContent.textContent = message.content

        const messageTimestamp = document.createElement('span')
        messageTimestamp.textContent = message.timestamp


        element.appendChild(imgContainer)
        imgContainer.appendChild(img)
        element.appendChild(messageContainer)
        messageContainer.appendChild(messageContent)
        messageContainer.appendChild(messageTimestamp)

        container.appendChild(element)

        container.scrollTop = container.scrollHeight
    }


    getRoomID() {
        return location.pathname.split("/")[2]
    }
}