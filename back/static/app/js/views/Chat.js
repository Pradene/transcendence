import { AbstractView } from "./AbstractView.js"

export class Chat extends AbstractView {
    constructor() {
        super()
    }

    async getHtml() {
        return `
            <div id="rooms"></div>
        `
    }

    async addEventListeners() {
        if (window.wsManager) {
            // request to get all rooms
            window.wsManager.sendMessage({ type: 'get_rooms' })
    
            // Create a promise to wait for the rooms
            const promise = new Promise((resolve, reject) => {
                window.wsManager.hs = function(data) {
                    resolve(data)
                }
            })

            // Wait for the rooms
            const data = await promise
            const rooms = data.rooms
            
            // Create container and build HTML structure
            const container = document.getElementById('rooms')
            rooms.forEach(room => {
                const div = document.createElement('div')
                div.innerHTML = `
                    <a href="/chat/${room.id}/" data-link>
                    ${room.name}
                    </a>
                `
    
                container.appendChild(div)
            })
        }
    }
}