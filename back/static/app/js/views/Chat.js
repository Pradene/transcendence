import { getCSRFToken } from "../utils.js"
import { AbstractView } from "./AbstractView.js"

export class Chat extends AbstractView {
    constructor() {
        super()

        this.rooms = []
    }

    async getHtml() {
        return `
<!--            <nav-component></nav-component>-->
            <div class="flex">
                <label>
                    <input type="text" id="input" class="search-bar" placeholder="Search" autocomplete="off"></input>
                </label>
                <a href='/chat/create-room/' data-link>Create Room</a>
            </div>
            <div>
                <ul id="rooms-list" class="list"></ul>
            </div>
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
        
        const rooms = document.querySelectorAll('.list-item')
        for (let room of rooms) {
            const name = room.querySelector('.name').textContent
            if (query && !name.includes(query)) {
                room.classList.add('hidden')
            } else {
                room.classList.remove('hidden')
            }
        }
    }

    displayRooms() {
        const container = document.getElementById('rooms-list')
        container.innerHTML = ''
        
        this.rooms.forEach((room) => {
            const el = document.createElement('li')
            el.classList.add('list-item')
            el.innerHTML = `
                <a href="/chat/${room.id}/" data-link>
                    <img class="profile-pic" alt="Profile Picture">
                    <div class="room-info">
                        <span class="name">${room.name}</span>
                        <span class="latest-message">Hello</span>
                    </div>
                </a>
            `

            container.appendChild(el)
        })
    }
}