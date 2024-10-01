import { getURL, apiRequest, getConnectedUserID } from "../utils/utils.js"
import { WebSocketManager } from "../utils/WebSocketManager.js"
import { TemplateComponent } from "../utils/TemplateComponent.js"

const buttonAcceptColor = "green"
const buttonRefuseColor = "red"

export class ChatRoom extends TemplateComponent {
    constructor() {
        super()

        this.sendMessageListener = async (e) => this.sendMessage(e) 
        this.WebsocketMessageListener = (e) => this.WebsocketMessage(e.detail)
        this.sendDuelInviteListener = async (e) => this.sendDuelInvite(e)
        this.acceptDuelListener = async (e) => this.acceptDuel(e)
        this.refuseDuelListener = async (e) => this.refuseDuel(e)

        this.challengerid = 0
    }

    unmount() {
        const form = this.getRef("form")
        form.addEventListener("submit", this.sendMessageListener)

        window.addEventListener("wsMessage", this.WebsocketMessageListener)

        // document.querySelector("button.duel-invite").removeEventListener("click", this.sendDuelInviteListener)
        // document.querySelector("button.duel-accept").removeEventListener("click", this.acceptDuelListener)
        // document.querySelector("button.duel-refuse").removeEventListener("click", this.refuseDuelListener)
    }

    async componentDidMount() {
        await this.getMessages()
        
        const form = this.getRef("form")
        form.addEventListener("submit", this.sendMessageListener)
        
        window.addEventListener("wsMessage", this.WebsocketMessageListener)

        // document.querySelector("button.duel-invite").addEventListener("click", this.sendDuelInviteListener)
        // document.querySelector("button.duel-accept").addEventListener("click", this.acceptDuelListener)
        // document.querySelector("button.duel-refuse").addEventListener("click", this.refuseDuelListener)
    }

    WebsocketMessage(event) {
        console.log(event)
        const message = event.message

        if (message.room_id != this.getRoomID()) {
            return
        } else if (message.action == "message") {
            const container = this.getRef("messages")
            this.displayMessage(container, message)
        } else if (message.action == "duel_request") {
            this.processDuelRequest(message)
        } else if (message.action == "duel_accept") {
            window.location.href = `/`
        } else if (message.action == "duel_refuse") {
            //TODO: Display duel refuse
        } else if (message.action == "duel_cancel") {
            //TODO: Display duel cancel
        }
    }

    processDuelRequest(message) {
        const who = message.challenged
        this.challengerid = message.challenger
        const userid = getConnectedUserID()

        if (getConnectedUserID() != who)
            return

        document.querySelector("button.duel-accept").style.backgroundColor = buttonAcceptColor
        document.querySelector("button.duel-refuse").style.backgroundColor = buttonRefuseColor
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

    async sendDuelInvite(event) {
        event.preventDefault()

        const roomID = this.getRoomID()
        const ws = WebSocketManager.get()
        await ws.sendMessage("chat", {
            type: "duel_request",
            room: roomID
        })
    }

    async acceptDuel(event) {
        event.preventDefault()

        const roomID = this.getRoomID()
        const ws = WebSocketManager.get()
        await ws.sendMessage("chat", {
            type: "duel_accept",
            room: roomID,
            challenger: this.challengerid
        })
    }

    async refuseDuel(event) {
        event.preventDefault()

        const roomID = this.getRoomID()
        const ws = WebSocketManager.get()
        await ws.sendMessage("chat", {
            type: "duel_refuse",
            room: roomID
        })
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
        element.classList.add('message')
        
        if (message.user_id === getConnectedUserID())
            element.classList.add("right")

        const imgContainer = document.createElement('a')
        imgContainer.href = `/users/${message.user_id}/`
        imgContainer.className = 'profile-picture'
        imgContainer.dataset.link = ''

        const img = document.createElement('img')
        img.src = message.picture
        
        const messageContainer = document.createElement('div')
        messageContainer.className = 'content'

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