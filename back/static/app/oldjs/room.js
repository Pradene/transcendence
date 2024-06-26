import { WebSocketSendMessage } from "./WebSocket"

function sendMessageToRoom() {
    const button = document.getElementById('message-submit-button')
    
    button.addEventListener('click', function (event) {
        event.preventDefault()

        input = document.getElementById('message-input')
        message = input.value

        WebSocketSendMessage(roomID, message)
        input.value = ''
    })
}

document.addEventListener('DOMContentLoaded', sendMessageToRoom)
document.addEventListener('update', sendMessageToRoom)