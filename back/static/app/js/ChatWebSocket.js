export class WebSocketManager {
    constructor() {
        if (WebSocketManager.instance)
            return WebSocketManager.instance

        this.socket = null
        this.handlers = []

        WebSocketManager.instance = this
    }

    connect(url) {
        this.socket = new WebSocket(url)

        this.socket.onopen = (event) => {
            console.log('WebSocket connection established')
        }

        this.socket.onmessage = (event) => {
            this.handleMessage(event)
        }

        this.socket.onclose = (event) => {
            console.log('WebSocket connection closed')
        }

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error)
        }
    }

    handleMessage(event) {
        const message = JSON.parse(event.data)

        const e = new CustomEvent('wsMessage', {detail: message})
        document.dispatchEvent(e)
    }

    sendMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message))
        }
    }

    static get() {
        return (WebSocketManager.instance ? WebSocketManager.instance : new WebSocketManager())
    }
}