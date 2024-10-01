import { getURL, apiRequest, getConnectedUserID } from "../utils/utils.js"
import { WebSocketManager } from "../utils/WebSocketManager.js"
import { TemplateComponent } from "../utils/TemplateComponent.js"
import {Router} from "../utils/Router";

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

        document.querySelector("button.duel-invite").removeEventListener("click", this.sendDuelInviteListener)
        document.querySelectorAll(".message button.accept").forEach((value, key, parent) => {
            value.removeEventListener('click', this.acceptDuelListener)
        })
        document.querySelectorAll(".message button.refuse").forEach((value, key, parent) => {
            value.removeEventListener('click', this.refuseDuelListener)
        })
    }

    async componentDidMount() {
        await this.getMessages()
        
        const form = this.getRef("form")
        form.addEventListener("submit", this.sendMessageListener)
        
        window.addEventListener("wsMessage", this.WebsocketMessageListener)

        document.querySelector("button.duel-invite").addEventListener("click", this.sendDuelInviteListener)
    }

    async WebsocketMessage(event) {
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
            const router = Router.get()
            await router.navigate("/")
        } else if (message.action == "duel_refuse") {
            this.processDuelRefuse(message)
        } else if (message.action == "duel_cancel") {
            //TODO: Display duel cancel
        }
    }

    processDuelRefuse(message) {
        document.querySelectorAll('.duel-request-message').forEach((value, key, parent) => {
            value.remove()
        })
    }

    processDuelRequest(message) {
        const who = message.challenged
        this.challengerid = message.challenger
        const userid = getConnectedUserID()

        if (getConnectedUserID() != who) {
            this.createRequestSendConfirmation(message)
            return
        }

        const container = document.querySelector("div.messages")
        const element = document.createElement('div')
        element.classList.add('message', 'duel-request-message')

        const imgContainer = document.createElement('a')
        imgContainer.href = `/users/${message.user_id}/`
        imgContainer.className = 'profile-picture'
        imgContainer.dataset.link = ''

        const img = document.createElement('img')

        const messageContainer = document.createElement('div')
        messageContainer.className = 'content'

        const text = document.createElement('p')
        text.textContent = "You have been invited to a duel: "

        const button_accept = document.createElement('button')
        button_accept.textContent = "Accept Duel"
        button_accept.className = "accept"

        const button_refuse = document.createElement('button')
        button_refuse.textContent = "Refuse Duel"
        button_refuse.className = "refuse"

        element.appendChild(imgContainer)


        imgContainer.appendChild(img)
        element.appendChild(messageContainer)
        messageContainer.appendChild(text)
        messageContainer.appendChild(button_accept)
        messageContainer.appendChild(button_refuse)
        container.appendChild(element)

        button_accept.addEventListener('click', this.acceptDuelListener)
        button_refuse.addEventListener('click', this.refuseDuelListener)

        container.scrollTop = container.scrollHeight

    }

    createRequestSendConfirmation(message) {
        const container = document.querySelector("div.messages")
        const element = document.createElement('div')
        element.classList.add('message', 'right', 'duel-request-message')

        const imgContainer = document.createElement('a')
        imgContainer.href = `/users/${message.user_id}/`
        imgContainer.className = 'profile-picture'
        imgContainer.dataset.link = ''

        const img = document.createElement('img')

        const messageContainer = document.createElement('div')
        messageContainer.className = 'content'

        const text = document.createElement('p')
        text.textContent = "You have invited your opponent to a duel, waiting for a replie..."

        element.appendChild(imgContainer)


        imgContainer.appendChild(img)
        element.appendChild(messageContainer)
        messageContainer.appendChild(text)
        container.appendChild(element)

        container.scrollTop = container.scrollHeight
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