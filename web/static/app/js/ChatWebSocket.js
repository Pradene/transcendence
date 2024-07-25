export class WebSocketManager {
    constructor() {
        if (WebSocketManager.instance)
            return WebSocketManager.instance

        this.sockets = {}

        WebSocketManager.instance = this
    }

    connect(url, type) {
        const socket = new WebSocket(url)

        socket.onopen = (event) => {
            console.log('WebSocket connection established')
        }

        socket.onmessage = (event) => {
            this.handleMessage(event)
        }

        socket.onclose = (event) => {
            console.log('WebSocket connection closed')
        }

        socket.onerror = (error) => {
            console.error('WebSocket error:', error)
        }

        this.sockets[type]= socket
    }

    disconnect(type) {
        const socket = this.sockets[type]
        if (!socket)
            return
        
        socket.close()
        delete this.sockets[type]
    }

    handleMessage(event) {
        const message = JSON.parse(event.data)

        const e = new CustomEvent('wsMessage', {
            detail: {
                message
            }
        })

        document.dispatchEvent(e)
    }

    sendMessage(type, message) {
        const socket = this.sockets[type]
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message))
        }
    }

    static get() {
        return WebSocketManager.instance ? WebSocketManager.instance : new WebSocketManager()
    }
}