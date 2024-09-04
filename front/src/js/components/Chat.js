import { getURL, apiRequest } from "../utils/utils.js"
import { TemplateComponent } from "../utils/TemplateComponent.js"
import { RoomComponent } from "./RoomComponent.js"
import { registerTemplates } from "../utils/Templates.js"

export class Chat extends TemplateComponent {
    constructor() {
        super()
    }

    async componentDidMount() {
        await this.getRooms()

        const input = this.getRef("input")
        input.addEventListener(
            "keyup",
            () => this.handleSearch(input.value)
        )
        
        window.addEventListener(
            "wsMessage",
            (event) => this.receiveMessage(event.detail)
        )
    }

    async getRooms() {
        try {
            const url = getURL("api/chat/rooms/")
            const rooms = await apiRequest(url)

            const container = this.getRef("rooms")
            rooms.forEach(async (room) => {
                const Room = new RoomComponent()
                const component = await Room.render(room)

                container.appendChild(component)
            })
            
        } catch (error) {
            console.log(error)
        }
    }

    async handleSearch(query) {
        const roomList = this.getRef("rooms")
        const rooms = roomList.children
        for (let room of rooms) {
            const name = room.querySelector(".chatroom-name").textContent
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
            const chatRooms = this.getRef("rooms")
            const chatRoom = chatRooms.querySelector(`[data-room-id="${message.room}"]`)
            
            const chatRoomMessage = chatRoom.querySelector(".chatroom-message")
            chatRoomMessage.textContent = truncateString(message.content, 48)

            // Modify thhe position of the room
            // to become the first element of the list
            chatRooms.insertBefore(chatRoom, chatRooms.firstChild)
        }
    }
}

registerTemplates("Chat", Chat)