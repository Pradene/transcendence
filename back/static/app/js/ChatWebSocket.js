export class WebSocketManager {
    constructor() {
        if (WebSocketManager.instance)
            return WebSocketManager.instance

        WebSocketManager.instance = this

        this.socket = null
        this.handlers = []
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
        const data = JSON.parse(event.data)

        this.handlers.forEach(handler => {
            if (handler.type == data.type)
                handler.callback(data)
        })
    }

    addHandler(type, callback) {
        this.handlers.push({type, callback})
    }

    sendMessage(message) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message))
        } else {
            console.error('WebSocket is not open. Ready state:', this.socket.readyState)
        }
    }
}