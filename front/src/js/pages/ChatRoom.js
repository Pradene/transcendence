import { getURL, apiRequest, getConnectedUserID } from "../utils/utils.js"
import { WebSocketManager } from "../utils/WebSocketManager.js"
import { TemplateComponent } from "../utils/TemplateComponent.js"
import { Router } from "../utils/Router";

const buttonAcceptColor = "green"
const buttonRefuseColor = "red"

export class ChatRoom extends TemplateComponent {
    constructor() {
        super()

        this.translations = {
            en: {
                send: "Send",
                invite: "Invite",
                writingInvite: "Write a message...",
                invitation_sent: "You have invited your opponent to a duel, waiting for a replie..."
            },
            de: {
                send: "Senden",
                invite: "Einladen",
                writingInvite: "Schreiben Sie eine Nachricht..."
            },
            fr: {
                send: "Envoyer",
                invite: "inviter",
                writingInvite: "Ecrivez un message...",
                invitation_sent: "Vous avez invitez votre ami a un duel, en attente de reponse..."
            }
        };

        this.sendMessageListener = async (e) => this.sendMessage(e)
        this.WebsocketMessageListener = (e) => this.WebsocketMessage(e.detail)
        this.sendDuelInviteListener = async (e) => this.sendDuelInvite(e)
        this.acceptDuelListener = async (e) => this.acceptDuel(e)
        this.refuseDuelListener = async (e) => this.refuseDuel(e)

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
        this.setupLanguageButtons();
        this.translatePage();
    }

    setupLanguageButtons() {
        document.querySelectorAll(".lang-button").forEach(button => {
            button.addEventListener("click", (e) => {
                this.currentLanguage = e.target.dataset.lang
                localStorage.setItem('selectedLanguage', this.currentLanguage)
                this.translatePage()
            })
        })
    }

    translatePage() {
        const elements = document.querySelectorAll("[data-translate-key]");
        elements.forEach(el => {
            const key = el.dataset.translateKey;
            if (this.translations[this.currentLanguage][key]) {
                el.textContent = this.translations[this.currentLanguage][key];
            }
            const input = this.getRef("input");
            if (input) {
                input.placeholder = this.translations[this.currentLanguage].writingInvite;
            }
        })
    }

    async WebsocketMessage(event) {
        console.log(event)
        const message = event.message

        if (message.room_id != this.getRoomID()) {
            return
        } else if (message.is_duel) {
            this.processDuelRequest(message)
        } else if (message.action == "message") {
            const container = this.getRef("messages")
            this.displayMessage(container, message)
        } else if (message.action == "duel_accept") {
            WebSocketManager.get().sendMessage("chat", {
                "type": "duel_response",
                "room_id": this.getRoomID()
            })
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
        const challenger = message.user_id
        const userid = getConnectedUserID()
        const main_container = document.querySelector("div.messages")

        if (message.is_duel_accepted && message.hasOwnProperty("game_data")) {
            this.processPlayedDuel(message)
        }

        console.log(`${userid} ${challenger}`)
        if (userid == challenger) {
            message.content = this.translations[this.currentLanguage].invitation_sent
            this.displayMessage(main_container, message)
            return
        }

        const container = document.createElement("div")
        container.classList.add("duel-container")

        const button_accept = document.createElement('button')
        button_accept.textContent = "Accept Duel"
        button_accept.className = "accept"

        const button_refuse = document.createElement('button')
        button_refuse.textContent = "Refuse Duel"
        button_refuse.className = "refuse"

        if (!message.is_duel_expired) {
            button_accept.addEventListener('click', this.acceptDuelListener)
            button_refuse.addEventListener('click', this.refuseDuelListener)
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
            type: "message",
            room: roomID,
            content: "",
            is_duel: true,
            duel_action: "duel_request"
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
                if (message.is_duel)
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
        messageContainer.appendChild(messageContent)

        if (innerElement !== null) {
            messageContainer.appendChild(innerElement)
        }

        const messageTimestamp = document.createElement('span')
        messageTimestamp.textContent = message.timestamp

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
