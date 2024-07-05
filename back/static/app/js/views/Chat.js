import { getCSRFToken } from "../utils.js"
import { AbstractView } from "./AbstractView.js"

export class Chat extends AbstractView {
    constructor() {
        super()

        this.rooms = []

        window.wsManager.addHandler('get_rooms', this.displayRooms.bind(this))
    }

    async getHtml() {
        return `
            <nav>
                <div>
                    <a href='/' data-link>Pong</a>
                </div>
            </nav>
            <div class="flex">
                <label>
                    <input type="text" id="input" class="" placeholder="Search" autocomplete="off"></input>
                </label>
                <a href='/create-room/' data-link>Create Room</a>
            </div>
            <div id="rooms"></div>
        `
    }

    async addEventListeners() {        
        const response = await fetch(`/api/chat/get-chatrooms/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            }
        })

        const data = await response.json()

        if (data.success) {
            this.rooms = data.rooms
            this.displayRooms()
        }

        const input = document.getElementById('input')
        input.addEventListener('keyup', this.handleSearch.bind(this))
    }
    
    async handleSearch(event) {
        const query = event.target.value
        
        const rooms = document.querySelectorAll('.room')
        for (let room of rooms) {
            const name = room.querySelector('a').textContent
            if (query && !name.includes(query)) {
                room.classList.add('hidden')
            } else {
                room.classList.remove('hidden')
            }
        }
    }

    displayRooms() {
        const container = document.getElementById('rooms')
        container.innerHTML = ''
        
        this.rooms.forEach((room) => {
            const div = document.createElement('div')
            div.classList.add('room')
            div.innerHTML = `
                <a href="/chat/${room.id}/" data-link>
                ${room.name}
                </a>
            `

            container.appendChild(div)
        })
    }
}