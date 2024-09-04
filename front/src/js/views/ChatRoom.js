import { getURL, apiRequest, getUserID } from "../utils/utils.js"
import { WebSocketManager } from "../utils/WebSocketManager.js"
import { Page } from "../utils/Component.js"
import { Nav } from "../components/Nav.js"

export class ChatRoom extends Page {
    constructor(container, props = {}) {
        super(container, props)

        this.lastSender = null
    }

    fetchData(callback) {
        const messagesPromise = this.getMessages()

        Promise.all([messagesPromise])
            .then(([messages]) => {
                this.messages = messages

                console.log(messages)

                if (typeof callback === "function") {
                    callback()
                }
            })
            .catch(error => {
                console.error("Error in fetchData:", error)
            })
    }

    create() {
        const content = document.createDocumentFragment()

        new Nav(content)
        
        return content

        return `
            <nav-component></nav-component>
            <div class="grid">
                <div id="chatroom" class="grid-item">
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

    componentDidMount() {
        const form = this.element.querySelector("#chatroom__form")
        this.addEventListeners(
            form,
            "submit",
            (event) => this.sendMessage(event)
        )
        
        this.addEventListeners(
            window,
            "wsMessage",
            (event) => this.WebsocketMessage(event.detail)
        )
    }

    WebsocketMessage(event) {
        console.log(event)
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


    getMessages() {
        try {
            const roomID = this.getID()
            const url = getURL(`api/chat/rooms/${roomID}/`)
            return apiRequest(url)
                .then(response => {
                    return response
                })
                .catch(error => {
                    throw error
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