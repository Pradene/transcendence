import { AbstractView } from "./AbstractView.js"

export class ChatRoom extends AbstractView {
    constructor() {
        super()
    }

    async getHtml() {
        return `
            <div id="chatroom">
                <div id="messages"></div>
                <div id="message-form-container">
                    <form id="message-form">
                        <input type="text" id="message-input" placeholder="Message..."></input>
                        <button type="submit" id="message-submit">Send</button>
                    </form>
                </div>
            </div>
        `
    }

    async getInitialMessages() {
        const roomID = this.getRoomID()

        await window.wsManager.sendMessage({
            type: 'get_room_message',
            room: roomID
        })
    
        // Create a promise to wait for the message
        const messagePromise = new Promise((resolve, reject) => {
            window.wsManager.hs = function(data) {
                resolve(data)
            }
        })

        // Wait for the message
        const data = await messagePromise
        
        const messages = data.messages
        
        messages.forEach(message => {
            this.displayMessage(message)
        })
    }

    handleSentMessage() {
        const button = document.getElementById('message-form')
        
        button.addEventListener('submit', async (event) => {
            event.preventDefault()

            const input = document.getElementById('message-input')
            const roomID = this.getRoomID()
            
            if (input.value != '') {
                await window.wsManager.sendMessage({
                    type: 'send_room_message',
                    room: roomID,
                    content: input.value
                })

                input.value = ''
            }
        })
    }

    addEventListeners() {
        if (window.wsManager) {
            this.getInitialMessages()
            this.handleSentMessage()
        }
    }

    getRoomID() {
        return location.pathname.split('/')[2]
    }

    displayMessage(message) {
        const container = document.getElementById('messages')
        const div = document.createElement('div')
        div.classList.add('message')
        div.innerHTML = `
            <h5>${message.user}</h5>
            <p>${message.content}</p>
        `

        container.appendChild(div)
    }
}