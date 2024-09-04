import { Nav } from "../components/NavComponent.js"
import { Page } from "../utils/Component.js"
import { getURL, apiRequest, truncateString } from "../utils/utils.js"
import { createElement } from "../utils/createElement.js"

export class Chat extends Page {
    constructor(container, props = {}) {
        super(container, props)
    }

    fetchData(callback) {
        const roomsPromise = this.getRooms()

        Promise.all([roomsPromise])
            .then(([rooms]) => {
                this.rooms = rooms

                if (typeof callback === "function") {
                    callback()
                }
            })
            .catch(error => {
                console.error("Error in fetchData:", error)
            })
    }

    create() {
        const content = createElement("div")

        // Nav
        const nav = new Nav(content)

        // Main content container
        const grid = document.createElement("div")
        grid.className = "grid"
        content.appendChild(grid)

        // Main content
        const chat = document.createElement("div")
        chat.id = "chat"
        chat.className = "grid-item"
        grid.appendChild(chat)

        // Search Bar
        const searchBarContainer = document.createElement("div")
        searchBarContainer.className = "top"
        chat.appendChild(searchBarContainer)

        const searchBar = document.createElement("label")
        searchBar.className = "search-bar"
        searchBarContainer.appendChild(searchBar)

        const searchBarInput = document.createElement("input")
        searchBarInput.required = true
        searchBarInput.autocomplete = "off"
        searchBarInput.type = "text"
        searchBarInput.id = "input"
        searchBarInput.placeholder = "Search a Conversation..."
        searchBar.appendChild(searchBarInput)

        // Chat rooms
        const chatRoomsContainer = document.createElement("div")
        chatRoomsContainer.className = "main"
        chat.appendChild(chatRoomsContainer)

        const chatRooms = document.createElement("ul")
        chatRooms.id = "chat__rooms"
        chatRooms.className = "list"
        chatRoomsContainer.appendChild(chatRooms)

        this.rooms.forEach(room => {
            console.log(room)
            this.displayRoom(chatRooms, room)
        })

        return content
    }

    componentDidMount() {
        const input = this.element.querySelector("input")
        this.addEventListeners(
            input,
            "keyup",
            (event) => this.handleSearch(event)
        )
        
        this.addEventListeners(
            window,
            "wsMessage",
            (event) => this.receiveMessage(event.detail)
        )
    }


    getRooms() {
        try {
            const url = getURL("api/chat/rooms/")
            return apiRequest(url)
                .then(response => {
                    return response
                })
                .catch(error => {
                    throw error
                })
            
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

        // Chat Room
        const chatRoom = document.createElement("li")
        chatRoom.className = "chat__room"
        container.appendChild(chatRoom)

        // Link
        const chatRoomLink = document.createElement("a")
        chatRoomLink.href = `/chat/${room.id}/`
        chatRoomLink.className = "list__item clickable"
        chatRoomLink.dataset.link = ""
        chatRoomLink.dataset.roomId = `${room.id}`
        chatRoom.appendChild(chatRoomLink)

        // Picture
        const chatRoomPictureContainer = document.createElement("div")
        chatRoomPictureContainer.className = "profile-picture"
        chatRoomLink.appendChild(chatRoomPictureContainer)

        const chatRoomPicture = document.createElement("img")
        chatRoomPicture.src = `${room.picture}`
        chatRoomPicture.alt = "Profile Picture"
        chatRoomPictureContainer.appendChild(chatRoomPicture)

        // Info
        const chatRoomInfo = document.createElement("div")
        chatRoomInfo.className = "main ml__12"
        chatRoomLink.appendChild(chatRoomInfo)

        // Name
        const chatRoomName = document.createElement("span")
        chatRoomName.className = "chat__room__name"
        chatRoomName.textContent = room.name
        chatRoomInfo.appendChild(chatRoomName)

        // Message
        const chatRoomMessage = document.createElement("span")
        chatRoomMessage.className = "chat__room__message"
        chatRoomMessage.textContent = message
        chatRoomInfo.appendChild(chatRoomMessage)
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
            const chatRooms = document.getElementById("chat__rooms")
            const chatRoom = chatRooms.querySelector(`[data-room-id="${message.room}"]`)
            
            const chatRoomMessage = chatRoom.querySelector(".chat__room__message")
            chatRoomMessage.textContent = truncateString(message.content, 48)

            // Modify thhe position of the room 
            // to become the first element of the list
            chatRooms.insertBefore(chatRoom, chatRooms.firstChild)
        }
    }
}
