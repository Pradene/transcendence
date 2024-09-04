import { getURL, apiRequest, truncateString } from "../utils.js"
import { AbstractView } from "./AbstractView.js"

export class Chat extends AbstractView {
    constructor() {
        super()
    }

    getHtml() {
        return `
            <nav-component></nav-component>
            <div class="grid">
                <div id="chat" class="grid__item">
                    <div class="top">
                        <label class="search-bar">
                            <input id="input" class="search-bar" type="text" placeholder="Search" autocomplete="off"></input>
                        </label>
                    </div>
                    <div class="main">
                        <ul id="chat__rooms" class="list"></ul>
                    </div>
                </div>
            </div>
        `
    }

    initView() {
        this.getRooms()

        const input = document.getElementById("input")
        this.addEventListeners(input, "keyup", (event) => this.handleSearch(event))
        
        this.addEventListeners(window, "wsMessage", (event) => this.receiveMessage(event.detail))
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

        const message = (room.last_message ? 
            truncateString(room.last_message.content, 48) :
            "Send a message..."
        )
        
        const el = document.createElement("li")
        el.classList.add("chat__room")
        el.innerHTML = `
            <a class="list__item clickable" href="/chat/${room.id}/" data-room-id="${room.id}" data-link>
                <div class="profile-picture">
                    <img src="${room.picture}" alt="Profile Picture">
                </div>
                <div class="main ml__12">
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
        const message = event.message
        
        if (message && message.action === "message") {
            const room = document.querySelector(`[data-room-id="${message.room}"]`)
            
            const last_message = room.querySelector(".chat__room__message")
            last_message.textContent = truncateString(message.content, 20)
        }
    }

    sortRoomsByTimestamp() {
        const rooms = document.querySelectorAll(".chat__room")
    }
}