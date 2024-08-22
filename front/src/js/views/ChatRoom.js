import { AbstractView } from "./AbstractView.js"
import { getURL, apiRequest, getUserID } from "../utils.js"
import { WebSocketManager } from "../WebSocketManager.js"

export class ChatRoom extends AbstractView {
    constructor() {
        super()

        this.lastSender = null

        this.sendMessageListener = (event) => this.sendMessage(event)
        this.WebsocketMessageListener = (event) => this.WebsocketMessage(event.detail)
    }

    getHtml() {
        return `
            <nav-component></nav-component>
            <div class="grid">
                <div id="chatroom" class="grid__item">
                    <div class="top">
                        <div id="chatroom__info"></div>
                    </div>
                    <div class="main">
                        <div id="chatroom__messages" class="list"></div>
                    </div>
                    <form id="chatroom__form" class="bottom">
                        <label class="search-bar">
                            <input type="text" placeholder="Write a message..." autocomplete=off></input>
                        </label>
                        <button type="submit" class="button ml__12">Send</button>
                    </form>
                </div>
            </div>
        `
    }

    initView() {
        this.getMessages() 
        
        this.addEventListeners()
    }
    
    addEventListeners() {
        const form = document.getElementById("chatroom__form")
        form.addEventListener("submit", this.sendMessageListener)
        
        window.addEventListener("wsMessage", this.WebsocketMessageListener)
    }

    removeEventListeners() {
        this.lastSender = null

        const form = document.getElementById("chatroom__form")
        form.removeEventListener("submit", this.sendMessageListener)

        window.removeEventListener("wsMessage", this.WebsocketMessageListener)
    }


    WebsocketMessage(event) {
        const message = event.message

        if (message.action == "message" && message.room_id == this.getID()) {
            const container = document.getElementById("chatroom__messages")
            this.displayMessage(container, message)
        }
    }


    async sendMessage(event) {
        event.preventDefault()

        const input = document.querySelector("#chatroom__form input")
        const value = input.value
        const roomID = this.getID()

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
        const roomID = this.getID()
        const url = getURL(`api/chat/rooms/${roomID}/`)

        try {
            const data = await apiRequest(url)
            console.log(data)

            // this.displayRoomInfo(data.room_name, data.room_picture)
            const roomName = document.getElementById("chatroom__info")
            roomName.textContent = data.room_name

            const container = document.getElementById("chatroom__messages")
            data.messages.forEach(message => {
                this.displayMessage(container, message)
            })

        } catch (error) {
            console.log(error)
        }
    }

    
    displayMessage(container, message) {
        if (!message)
            return

        if (this.lastSender === message.username) {
            const messageContainer = Array.from(
                document.querySelectorAll(".message__container")
            ).pop().querySelector("div:last-child")

            const el = document.createElement("div")
            el.classList.add("message")
            el.innerHTML = `
                <p>${message.content}</p>
                <span>${message.timestamp}</span>
            `

            messageContainer.appendChild(el)

        } else {
            const el = document.createElement("div")
            el.classList.add("message__container")
            
            if (message.user_id == getUserID())
                el.classList.add("right")
            
            el.innerHTML = `
                <a href="/user/${message.user_id}" class="profile-picture" data-link>
                    <img src="${message.picture}"></img>
                </a>
                <div>
                    <div class="message">
                        <p>${message.content}</p>
                        <span>${message.timestamp}</span>
                    </div>
                </div>
            `

            container.appendChild(el)
        }

        container.scrollTop = container.scrollHeight
        this.lastSender = message.username
    }


    getID() {
        return location.pathname.split("/")[2]
    }
}