import { AbstractView } from "./AbstractView.js"
import { getURL, getRequest } from "../utils.js"

export class ChatRoom extends AbstractView {
    constructor() {
        super()

        this.handleSentMessage = this.handleSentMessage.bind(this)
        this.handleReceivedMessage = this.handleReceivedMessage.bind(this)
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
        this.getInitialMessages()
        
        const form = document.getElementById('message-form')
        form.removeEventListener('submit', this.handleSentMessage)
        form.addEventListener('submit', this.handleSentMessage)
        
        document.removeEventListener('wsMessage', this.handleReceivedMessage)
        document.addEventListener('wsMessage', this.handleReceivedMessage)
    }


    async getInitialMessages() {
        const roomID = this.getRoomID()
        const url = getURL(`api/chat/rooms/${roomID}/`)

        try {
            const data = await getRequest(url)
            
            console.log(data)
            if (data.room && data.room.messages)
                this.displayMessages(data.room.messages)
    
        } catch (error) {
            console.log(error)
        }
    }


    async handleSentMessage(event) {        
        event.preventDefault()
    
        const input = document.getElementById('message-input')
        const value = input.value
        const roomID = this.getRoomID()
        console.log('message sent')
        if (input.value != '') {                
            await window.wsManager.sendMessage({
                type: 'message',
                room: roomID,
                content: value
            })
            input.value = ''
        }
    }


    handleReceivedMessage(event) {
        const message = event.detail
        console.log(message)

        if (message.room == this.getRoomID()) {
            this.displayMessage(message)
        }
    }


    getRoomID() {
        return location.pathname.split('/')[2]
    }


    displayMessages(messages) {
        if (!messages)
            return

        messages.forEach(message => this.displayMessage(message))
    }
    
    displayMessage(message) {
        if (!message)
            return

        const container = document.getElementById('messages')
        
        const el = document.createElement('div')
        el.classList.add('message')
        el.innerHTML = `
            <div>
                <h5>${message.username}</h5>
                <p>${message.content}</p>
            </div>
        `

        if (message.user === localStorage.getItem('username'))
            el.classList.add('send')
        else
            el.classList.add('received')

        container.appendChild(el)
        container.scrollTop = container.scrollHeight
    }
}