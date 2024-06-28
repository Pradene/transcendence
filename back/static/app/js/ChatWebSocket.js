export class WebSocketManager {
    constructor(url) {
        this.url = url
        this.socket = null
        this.messageHandlers = []
        
        this.connect()

        this.hs = this.handleMessage.bind(this)
    }

    connect() {
        this.socket = new WebSocket(this.url)

        this.socket.onopen = (event) => {
            console.log('WebSocket connection established')
        }

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            this.hs(data)
        }

        this.socket.onclose = (event) => {
            console.log('WebSocket connection closed')
        }

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error)
        }
    }

    // Override this function in chatroom to handle message in chatroom
    handleMessage(data) {
        console.log('received data:', data)
    }

    sendMessage(message) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message))
        } else {
            console.error('WebSocket is not open. Ready state:', this.socket.readyState)
        }
    }
}