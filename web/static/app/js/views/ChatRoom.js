import { AbstractView } from "./AbstractView.js"
import { getURL, apiRequest } from "../utils.js"
import { WebSocketManager } from "../WebSocketManager.js"

export class ChatRoom extends AbstractView {
    constructor() {
        super()

        this.sendMessageListener = (event) => this.sendMessage(event)
        
        this.WebsocketMessageListener = (event) => this.WebsocketMessage(event.detail)
    }

    getHtml() {
        return `
            <nav-component></nav-component>
            <div id="chatroom">
                <div id="chatroom__messages"></div>
                <form id="chatroom__form">
                    <label class="search-bar">
                        <input type="text" placeholder="Write a message..." autocomplete=off></input>
                    </label>
                    <button type="submit" class="button" style="margin-left: 12px;">Send</button>
                </form>
            </div>
        `
    }

    initView() {
        this.getMessages() 
        
        this.addEventListeners()
    }
    
    addEventListeners() {
        const form = document.getElementById('chatroom__form')
        form.addEventListener('submit', this.sendMessageListener)
        
        window.addEventListener('wsMessage', this.WebsocketMessageListener)
    }

    removeEventListeners() {
        const form = document.getElementById('chatroom__form')
        form.removeEventListener('submit', this.sendMessageListener)

        window.removeEventListener('wsMessage', this.WebsocketMessageListener)
    }


    WebsocketMessage(event) {
        const message = event.message
        console.log("chatroom message", message)

        if (message.action == "message" && message.room == this.getRoomID()) {
            this.displayMessage(message)
        }
    }


    async getMessages() {
        const roomID = this.getRoomID()
        const url = getURL(`api/chat/rooms/${roomID}/`)

        try {
            const messages = await apiRequest(url)
            console.log(messages)

            messages.forEach(message => {
                this.displayMessage(message)
            })

        } catch (error) {
            console.log(error)
        }
    }


    async sendMessage(event) {
        event.preventDefault()

        const input = document.querySelector('#chatroom__form input')
        const value = input.value
        const roomID = this.getRoomID()

        if (input.value != '') {
            const ws = WebSocketManager.get()
            await ws.sendMessage('chat', {
                type: 'message',
                room: roomID,
                content: value
            })

            input.value = ''
        }
    }

    
    displayMessage(message) {
        if (!message)
            return

        const username = message.user
        const content = message.content

        const container = document.getElementById('chatroom__messages')

        const el = document.createElement('div')
        el.classList.add('chatroom__message')
        el.classList.add('sender')

        el.innerHTML = `
            <div>
                <h5>${username}</h5>
                <p>${content}</p>
            </div>
        `

        container.appendChild(el)
        container.scrollTop = container.scrollHeight
    }


    getRoomID() {
        return location.pathname.split('/')[2]
    }
}