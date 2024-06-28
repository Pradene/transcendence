import { AbstractView } from "./AbstractView.js"

export class Chat extends AbstractView {
    constructor() {
        super()

        window.wsManager.addHandler('get_rooms', this.getRooms.bind(this))
    }

    async getHtml() {
        return `
            <div id="rooms"></div>
        `
    }

    async getRooms(data) {
        const rooms = data.rooms

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

    async addEventListeners() {
        if (window.wsManager) {
            window.wsManager.sendMessage({ type: 'get_rooms' })
        }
    }
}