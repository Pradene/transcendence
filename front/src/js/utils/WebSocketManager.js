import { checkLogin } from "./utils.js"

export class WebSocketManager {
    constructor() {
        if (WebSocketManager.instance)
            return WebSocketManager.instance

        WebSocketManager.instance = this
        
        this.sockets = {}
        this.pendingMessages = {} // Queue messages until the socket is open
    }

    static get() {
        return WebSocketManager.instance ? WebSocketManager.instance : new WebSocketManager()
    }

    connect(url, type) {
        if (this.sockets[type]) {
            return
        }
        
        const socket = new WebSocket(url)

        socket.onopen = (event) => {
            this.flushPendingMessages(type)
            
            console.log('WebSocket connection established')
        }

        socket.onmessage = (event) => {
            this.handleMessage(event)
        
            console.log("WebSocket message")
        }

        socket.onclose = (event) => {
            console.log('WebSocket connection closed')
        }

        socket.onerror = (error) => {
            console.error('WebSocket error:', error)
        }

        this.sockets[type] = socket

        // Save connection info to localStorage
        this.saveConnection(type, url)
    }

    disconnect(type) {
        const socket = this.sockets[type]
        if (!socket) return

        socket.close()
        delete this.sockets[type]

        // Remove connection info from localStorage
        this.removeConnection(type)
    }

    handleMessage(event) {
        const message = JSON.parse(event.data)

        const e = new CustomEvent('wsMessage', {
            detail: { message }
        })

        window.dispatchEvent(e)
    }

    sendMessage(type, message) {
        try {
            const socket = this.sockets[type]
            console.log("socket")

            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(message))
                console.log("sending")

            } else {
                this.queueMessage(type, message) // Queue the message if the socket isn't ready
                
                if (!socket) {
                    // Attempt to reconnect if the socket is not present
                    const connections = JSON.parse(localStorage.getItem('wsConnections')) || {};
                    const url = connections[type];
                    if (url) {
                        this.connect(url, type);
                    }
                }
            }

        } catch (error) {
            console.log(error)
        }
    }

    saveConnection(type, url) {
        const connections = JSON.parse(localStorage.getItem('wsConnections')) || {}
        connections[type] = url
        localStorage.setItem('wsConnections', JSON.stringify(connections))
    }

    removeConnection(type) {
        const connections = JSON.parse(localStorage.getItem('wsConnections')) || {}
        delete connections[type]
        localStorage.setItem('wsConnections', JSON.stringify(connections))
    }

    reconnectAllSockets() {
        if (checkLogin()) {
            const connections = JSON.parse(localStorage.getItem('wsConnections')) || {}
            Object.keys(connections).forEach(type => {
                this.connect(connections[type], type)
            })
        }
    }

    queueMessage(type, message) {
        if (!this.pendingMessages[type]) {
            this.pendingMessages[type] = []
        }

        this.pendingMessages[type].push(message)
    }

    flushPendingMessages(type) {
        const socket = this.sockets[type]
        if (socket && socket.readyState === WebSocket.OPEN) {
            const messages = this.pendingMessages[type] || []
            
            messages.forEach(message => {
                socket.send(JSON.stringify(message))
            })
            
            this.pendingMessages[type] = []
        }
    }
}