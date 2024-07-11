import { getCSRFToken } from "../utils.js"
import { AbstractView } from "./AbstractView.js"

export class Chat extends AbstractView {
    constructor() {
        super()

        this.handleSearch = this.handleSearch.bind(this)
        this.handleReceivedMessage = this.handleReceivedMessage.bind(this)
    }

    getHtml() {
        return `
            <nav-component></nav-component>
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
        await this.getInitialData()

        const input = document.getElementById('input')
        input.removeEventListener('keyup', this.handleSearch)
        input.addEventListener('keyup', this.handleSearch)
    
        document.removeEventListener('wsMessage', this.handleReceivedMessage)
        document.addEventListener('wsMessage', this.handleReceivedMessage)
    }

    async getInitialData() {
        try {
            const access = localStorage.getItem('access')

            const response = await fetch(`/api/chat/rooms/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                const rooms = data.rooms
                this.displayRooms(rooms)
            
            } else {
                console.log('Failed to fetch data')
            }

        } catch (error) {
            console.log(error)
        }
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

    handleReceivedMessage(event) {
        const message = event.detail

        const rooms = document.querySelectorAll('.room')
        console.log(message)
    }

    displayRooms(rooms) {
        if (!rooms)
            return

        rooms.forEach(room => this.displayRoom(room))
    }
    
    displayRoom(room) {
        if (!room)
            return

        const container = document.getElementById('rooms-list')
        const message = (room.last_message ? room.last_message.content : 'Send a message...')
        
        const el = document.createElement('li')
        el.classList.add('list-item')
        el.innerHTML = `
            <a href="/chat/${room.id}/" data-link>
                <img class="profile-pic" alt="Profile Picture">
                <div class="room-info">
                    <span class="name">${room.name}</span>
                    <span class="latest-message">${message}</span>
                </div>
            </a>
        `
        
        container.appendChild(el)
    }
}