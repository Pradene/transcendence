import { AbstractView } from "./AbstractView.js"
import { getURL, apiRequest } from "../utils.js"
import { WebSocketManager } from "../ChatWebSocket.js"

export class ChatRoom extends AbstractView {
    constructor() {
        super()

        this.sendMessageListener = (event) => {
            event.preventDefault()
            this.sendMessage()
        }
        
        this.receiveMessageListener = (event) => this.receiveMessage(event.detail)
    }

    getHtml() {
        return `
        <nav-component></nav-component>
        <div id="chatroom">
            <div id="messages"></div>
            <div id="message-form-container">
                <form id="message-form">
                    <input type="text" id="message-input" placeholder="Message..." autocomplete=off></input>
                    <button type="submit" id="message-submit">Send</button>
                </form>
            </div>
        </div>
        `
    }

    addEventListeners() {
        this.getMessages()
        
        const form = document.getElementById('message-form')
        
        form.removeEventListener('submit', this.sendMessageListener)
        form.addEventListener('submit', this.sendMessageListener)
        
        document.removeEventListener('wsMessage', this.receiveMessageListener)
        document.addEventListener('wsMessage', this.receiveMessageListener)
    }


    async getMessages() {
        const roomID = this.getRoomID()
        const url = getURL(`api/chat/rooms/${roomID}/`)

        try {
            const data = await apiRequest(url)
            console.log(data)
            this.displayMessages(data)
    
        } catch (error) {
            console.log(error)
        }
    }


    async sendMessage() {
        const input = document.getElementById('message-input')
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


    receiveMessage(data) {
        const message = data.message
        console.log(message)

        if (message.action == "message"
        && message.room == this.getRoomID()) {
            this.displayMessage(message)
        }
    }


    displayMessages(messages) {
        if (!messages)
            return

        messages.forEach(message => this.displayMessage(message))
    }
    
    displayMessage(message) {
        if (!message)
            return

        const username = message.user
        const content = message.content
        
        const container = document.getElementById('messages')

        const el = document.createElement('div')
        el.classList.add('message')
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