import { WebSocketManager } from '../utils/WebSocketManager.js'

class FriendButton extends HTMLElement {
    constructor() {
        super()

        this._button = document.createElement('button')
        this._status = null
        this._id = null
    }

    set status(newStatus) {
        this._status = newStatus
        this.updateButtonLabel()
    }

    get status() {
        return this._status
    }

    get id() {
        return this._id
    }
    
    set id(newId) {
        this._id = newId
    }

    updateButtonLabel() {
        switch (this._status) {
            case 'friend':
                this._button.textContent = 'Remove friend'
                break
            case 'request_sent':
                this._button.textContent = 'Cancel'
                break
            case 'request_received':
                this._button.textContent = 'Accept'
                break
            case 'none':
            default:
                this._button.textContent = 'Add friend'
                break
        }
    }

    connectedCallback() {
        this._button.className = 'button'

        this._button.addEventListener('click', async () => {
            console.log(this._id)
            await this.handleClick()
        })

        window.addEventListener('wsMessage', (e) => this.handleWebsocketMessage(e.detail))

        this.appendChild(this._button)
    }

    async handleClick() {
        switch (this.status) {
            case 'friend':
                // Handle unfriending
                await this.removeFriend()
                this.status = 'none'
                break
            case 'request_received':
                // Handle accepting the request
                await this.acceptIncomingFriendRequest()
                this.status = 'friend'
                break
            case 'request_sent':
                // Handle canceling the request
                await this.cancelFriendRequest()
                this.status = 'none'
                break
            case 'none':
                // Handle sending a new friend request
                await this.sendFriendRequest()
                this.status = 'request_sent'
                break
        }
    }

    handleWebsocketMessage(e) {
        console.log(e)
        const message = e.message

        if (!message || !message.action) return 

        if (message.action === 'friend_request_received') {
            this.status = 'request_received'
        } else if (message.action === 'friend_request_accepted') {
            this.status = 'friend'
        } else if (message.action === 'friend_request_declined') {
            this.status = 'none'
        } else if (message.action === 'friend_request_cancelled') {
            this.status = 'none'
        } else if (message.action === 'friend_removed') {
            this.status = 'none'
        }
    }

    async sendFriendRequest() {
        const ws = WebSocketManager.get()

        await ws.sendMessage('friends', {
            'type': 'friend_request_sended',
            'user_id': this._id
        })
    }

    async acceptIncomingFriendRequest() {
        const ws = WebSocketManager.get()

        await ws.sendMessage('friends', {
            'type': 'friend_request_accepted',
            'user_id': this._id
        })
    }

    async declineIncomingFriendRequest() {
        const ws = WebSocketManager.get()

        await ws.sendMessage('friends', {
            'type': 'friend_request_declined',
            'user_id': this._id
        })
    }

    async cancelFriendRequest() {
        const ws = WebSocketManager.get()

        await ws.sendMessage('friends', {
            'type': 'friend_request_cancelled',
            'user_id': this._id
        })
    }

    async removeFriend() {
        const ws = WebSocketManager.get()

        await ws.sendMessage('friends', {
            'type': 'friend_removed',
            'user_id': this._id
        })
    }
}

customElements.define('friend-button', FriendButton)
