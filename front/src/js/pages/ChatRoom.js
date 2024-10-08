import { getURL, apiRequest, getConnectedUserID } from "../utils/utils.js"
import { WebSocketManager } from "../utils/WebSocketManager.js"
import { TemplateComponent } from "../utils/TemplateComponent.js"
import { Router } from "../utils/Router";

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
		this.cancelDuelListener = async (e) => this.cancelDuel(e)

        this.challengerid = 0
        this.room_id = null
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
		document.querySelectorAll(".message button.cancel").forEach((value, key, parent) => {
            value.removeEventListener('click', this.cancelDuelListener)
        })

        WebSocketManager.get().sendMessage("chat", {
            "type": "quit_room",
            "room_id": this.room_id
        })
    }

    async componentDidMount() {
        this.room_id = this.getRoomID()
        await this.getMessages()
        
        const form = this.getRef("form")
        form.addEventListener("submit", this.sendMessageListener)
        
        window.addEventListener("wsMessage", this.WebsocketMessageListener)

        document.querySelector("button.duel-invite").addEventListener("click", this.sendDuelInviteListener)
    }

    async WebsocketMessage(event) {
        console.log('bob', event)
        const message = event.message

        if (message.room_id != this.getRoomID()) {
            return
        } else if (message.type == "invitation" && message.status == 'pending') {
            this.processDuelRequest(message)
        } else if (message.action == "message") {
            const container = this.getRef("messages")
            this.displayMessage(container, message)
        } else if (message.status == "accepted") {
            const router = Router.get()
            await router.navigate("/")
        } else if (message.status == "declined") {
            this.processDuelRefuse(message)
        } else if (message.status == "canceled") {
            this.processDuelCancel(message)
        }
    }

    processDuelRefuse(message) {
        document.querySelectorAll('.duel-request-message').forEach((value, key, parent) => {
            value.remove()
        })
    }

	processDuelCancel(message) {
        document.querySelectorAll('.duel-request-message').forEach((value, key, parent) => {
            value.remove()
        })
    }

    processPlayedDuel(message) {
        message.content = ''
        const game_data = message.game_data
        const userid = getConnectedUserID()

        const results = document.createElement('h3')
        results.textContent = `${game_data.user1}:${game_data.user1_score} - ${game_data.user2}:${game_data.user2_score}`

        const message_element = document.createElement("h3")
        message_element.textContent = `You ${game_data.winner_id === userid ? "won" : "lost"} the duel!`

        const container = document.createElement("div")
        container.classList.add("duel-result")
        container.appendChild(message_element)
        container.appendChild(results)

        this.displayMessage(document.querySelector(".messages"), message, container)
    }

    processDuelRequest(message) {
        const challenger = message.user
        const userid = getConnectedUserID()
        const main_container = document.querySelector("div.messages")
		
        if (message.is_duel_accepted && message.hasOwnProperty("game_data")) {
			this.processPlayedDuel(message)
        }
		
        console.log(`${userid} ${challenger}`)
        if (userid == challenger) {
			const pendingContainer = document.createElement("div")
			pendingContainer.classList.add("pending-container")
			pendingContainer.dataset.invitationId = message.id
			message.content = "You have invited your opponent to a duel, waiting for a reply..."
            const buttonCancel = document.createElement('button')
			buttonCancel.className = 'cancel'
			buttonCancel.textContent = 'Cancel Duel'
			buttonCancel.addEventListener('click', event => this.cancelDuelListener(event))
			pendingContainer.appendChild(buttonCancel)
			this.displayMessage(main_container, message, pendingContainer)
            return
        }
		
        const container = document.createElement("div")
        container.classList.add("duel-container")
		container.dataset.invitationId = message.id;
		console.log(message)

        const button_accept = document.createElement('button')
        button_accept.textContent = "Accept Duel"
        button_accept.className = "accept"

        const button_refuse = document.createElement('button')
        button_refuse.textContent = "Refuse Duel"
        button_refuse.className = "refuse"

        if (!message.status != 'Canceled') {
            button_accept.addEventListener('click', event => this.acceptDuelListener(event))
            button_refuse.addEventListener('click', event => this.refuseDuelListener(event))
        }

        message.content = "You have been invited to a duel: "
        container.appendChild(button_accept)
        container.appendChild(button_refuse)

        this.displayMessage(main_container, message, container)
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
                room_id: roomID,
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
            type: "send_invitation",
            room_id: roomID,
			user_id: getConnectedUserID(),
            content: "",
            /* is_duel: true,
            duel_action: "duel_request" */
        })
    }

    async acceptDuel(event) {
		const target = event.target

        const roomID = this.getRoomID()
        const ws = WebSocketManager.get()
		const invitation = target.closest('div.duel-container')
		const invitation_id = invitation.getAttribute('data-invitation-id')
		console.log(invitation)
		console.log(invitation_id)
        await ws.sendMessage("chat", {
            type: "accept_invitation",
            room_id: roomID,
            invitation_id: invitation_id
        })
    }

    async refuseDuel(event) {
        const target = event.target

        const roomID = this.getRoomID()
        const ws = WebSocketManager.get()
		const invitation = target.closest('div.duel-container')
		const invitation_id = invitation.getAttribute('data-invitation-id')
        await ws.sendMessage("chat", {
            type: "decline_invitation",
            room_id: roomID,
			invitation_id: invitation_id
        })
    }

	async cancelDuel(event) {
        const target = event.target

        const roomID = this.getRoomID()
        const ws = WebSocketManager.get()
		const invitation = target.closest('div.pending-container')
		const invitation_id = invitation.getAttribute('data-invitation-id')
        await ws.sendMessage("chat", {
            type: "cancel_invitation",
            room_id: roomID,
			invitation_id: invitation_id
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
                if (message.type == "invitation")
                    this.processDuelRequest(message)
                else
                    this.displayMessage(container, message)
            })

        } catch (error) {
            console.log(error)
        }
    }

    
    displayMessage(container, message, innerElement = null) {
        if (!message)
            return

        const element = document.createElement("div")
        element.classList.add('message')
        
        if (message.user_id === getConnectedUserID() || message.user === getConnectedUserID())
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
        messageContainer.appendChild(messageContent)

        if (innerElement !== null) {
            messageContainer.appendChild(innerElement)
        }

        const messageTimestamp = document.createElement('span')
        messageTimestamp.textContent = message.elapsed_timestamp

        element.appendChild(imgContainer)
        imgContainer.appendChild(img)
        element.appendChild(messageContainer)
        messageContainer.appendChild(messageTimestamp)

        container.appendChild(element)

        container.scrollTop = container.scrollHeight
    }


    getRoomID() {
        return location.pathname.split("/")[2]
    }
}