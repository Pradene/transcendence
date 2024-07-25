import { getURL, apiRequest } from "../utils.js"
import { AbstractView } from "./AbstractView.js"

export class Chat extends AbstractView {
    constructor() {
        super()

        this.handleSearchListener = (event) => this.handleSearch(event)
        this.receiveMessageListener = (event) => this.receiveMessage(event.detail)
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

    addEventListeners() {
        this.getRooms()

        const input = document.getElementById('input')

        input.removeEventListener('keyup', this.handleSearchListener)
        input.addEventListener('keyup', this.handleSearchListener)
    
        document.removeEventListener('wsMessage', this.receiveMessageListener)
        document.addEventListener('wsMessage', this.receiveMessageListener)
    }

    async getRooms() {
        const url = getURL('api/chat/rooms/')
        
        try {
            const data = await apiRequest(url)
            this.displayRooms(data)
            
        } catch (error) {
            console.log(error)
        }
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
        el.classList.add('list__item')
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
    

    async handleSearch(event) {
        const query = event.target.value
        
        const rooms = document.querySelectorAll('.list__item')
        for (let room of rooms) {
            const name = room.querySelector('.name').textContent
            if (query && !name.includes(query)) {
                room.classList.add('hidden')
            } else {
                room.classList.remove('hidden')
            }
        }
    }

    receiveMessage(data) {
        const rooms = document.querySelectorAll('.room')
        console.log(data)
    }
}