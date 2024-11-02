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

        this.saveConnection(type, url)

        return socket
    }

    static remove(type) {
        const socket = this.sockets[type]
        if (!socket) return

        delete this.sockets[type]
        socket.close()

        this.removeConnection(type)
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
                    const connections = JSON.parse(localStorage.getItem('sockets')) || {}
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
        let sockets = {}

        try {
            const storedSockets = localStorage.getItem('sockets')
            sockets = storedSockets ? JSON.parse(storedSockets) : {}
        
        } catch (error) {
            console.error('Error parsing sockets from localStorage:', error)
            sockets = {}
        }

        sockets[type] = url

        try {
            localStorage.setItem('sockets', JSON.stringify(sockets))
        
        } catch (error) {
            console.error('Error saving sockets to localStorage:', error)
        }
    }

    static removeConnection(type) {
        const sockets = JSON.parse(localStorage.getItem('sockets')) || {}
        delete sockets[type]
        localStorage.setItem('sockets', '')
    }

    static reconnectAllSockets() {
        const sockets = JSON.parse(localStorage.getItem('sockets')) || {}
        Object.keys(sockets).forEach(type => {
            this.connect(sockets[type], type)
        })
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
