import { getURL, apiRequest, truncateString } from "../utils.js"
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
            <div class="chat">
                <div class="chat__search">
                    <label class="search-bar">
                        <input type="text" id="input" class="search-bar" placeholder="Search" autocomplete="off"></input>
                    </label>
                </div>
                <div>
                    <ul id="chat__rooms"></ul>
                </div>
            </div>
        `
    }

    initView() {
        this.getRooms()

        this.addEventListeners()
    }
    
    addEventListeners() {
        const input = document.getElementById("input")
        input.addEventListener("keyup", this.handleSearchListener)

        window.addEventListener("wsMessage", this.receiveMessageListener)
    }
    
    removeEventListeners() {
        const input = document.getElementById("input")
        input.removeEventListener("keyup", this.handleSearchListener)

        window.removeEventListener("wsMessage", this.receiveMessageListener)
    }

    async getRooms() {
        try {
            const url = getURL("api/chat/rooms/")
            
            const rooms = await apiRequest(url)
            console.log("rooms:", rooms)

            const container = document.getElementById("chat__rooms")
            rooms.forEach(room => this.displayRoom(container, room))
            
        } catch (error) {
            console.log(error)
        }
    }

    
    displayRoom(container, room) {
        if (!room)
            return

        const room_message = truncateString(room.last_message.content, 20)
        const message = (room.last_message ? room_message : "Send a message...")
        
        const el = document.createElement("li")
        el.classList.add("chat__room")
        el.innerHTML = `
            <a href="/chat/${room.id}/" data-room-id="${room.id}" data-link>
                <div class="profile-picture">
                    <img src="${room.picture}" class="profile-pic" alt="Profile Picture">
                </div>
                <div class="chat__room__info">
                    <span class="chat__room__name">${room.name}</span>
                    <span class="chat__room__message">${message}</span>
                </div>
            </a>
        `
        
        container.appendChild(el)
    }
    

    async handleSearch(event) {
        const query = event.target.value
        
        const rooms = document.querySelectorAll(".chat__room")
        for (let room of rooms) {
            const name = room.querySelector(".chat__room__name").textContent
            if (query && !name.includes(query)) {
                room.classList.add("hidden")
            } else {
                room.classList.remove("hidden")
            }
        }
    }

    receiveMessage(event) {
        console.log(event)
        
        const message = event.message
        if (message && message.action === "message") {
            const room = document.querySelector(`[data-room-id="${message.room}"]`)
            console.log(room)
            
            const last_message = room.querySelector(".chat__room__message")
            console.log(last_message)
            last_message.textContent = truncateString(message.content, 20)
        }
    }

    sortRoomsByTimestamp() {
        const rooms = document.querySelectorAll(".chat__room")
    }
}