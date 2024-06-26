export function WebSocketConnect(url) {

    websocket = new WebSocket(url)
    
    websocket.onopen = function(event) {
        console.log('WebSocket connection established.')
        console.log(event)
    }

    websocket.onmessage = function(event) {
        const message = JSON.parse(event.data)
        console.log('Received message:', message)
    }

    websocket.onclose = function() {
        console.log('WebSocket closed')
    }

    websocket.onerror = function(error) {
        console.log('error: ', error)
    }

    return websocket
}

export function WebSocketSendMessage(roomID, message) {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        
        message = {
            'message': message,
            'room': roomID,
        }

        websocket.send(JSON.stringify(message))

    } else {
        console.log('error: cannot send message to ws')
    }
}