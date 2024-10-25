import { checkLogin } from "./utils.js"

export class WSManager {
    static sockets = {}
    static pendingMessages = {}

    static add(type, url) {
        if (this.sockets[type]) {
            console.log(`Already connected to socket type ${type}`)
            return this.sockets[type]
        }

        const socket = new WebSocket(url)
        this.sockets[type] = socket

        return socket
    }

    static remove(type) {
        const socket = this.sockets[type]
        if (!socket) return

        delete this.sockets[type]
        socket.close()
    }

    static get(type) {
        return this.sockets[type]
    }

    static send(type, message) {
        try {
            const socket = this.sockets[type]
            console.log("socket:", socket)

            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(message))
                console.log("sending")

            } else {
                this.queueMessage(type, message) // Queue the message if the socket isn't ready
                
                if (!socket) {
                    // Attempt to reconnect if the socket is not present
                    const connections = JSON.parse(localStorage.getItem('wsConnections')) || {}
                    const url = connections[type]
                    if (url) {
                        this.connect(url, type)
                    }
                }
            }

        } catch (error) {
            console.log(error)
        }
    }

    static saveConnection(type, url) {
        const connections = JSON.parse(localStorage.getItem('wsConnections')) || {}
        connections[type] = url
        localStorage.setItem('wsConnections', JSON.stringify(connections))
    }

    static removeConnection(type) {
        const connections = JSON.parse(localStorage.getItem('wsConnections')) || {}
        delete connections[type]
        localStorage.setItem('wsConnections', '')
    }

    static reconnectAllSockets() {
        if (checkLogin()) {
            const connections = JSON.parse(localStorage.getItem('wsConnections')) || {}
            Object.keys(connections).forEach(type => {
                this.connect(connections[type], type)
            })
        }
    }

    static queueMessage(type, message) {
        if (!this.pendingMessages[type]) {
            this.pendingMessages[type] = []
        }

        this.pendingMessages[type].push(message)
    }

    static flushPendingMessages(type) {
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
