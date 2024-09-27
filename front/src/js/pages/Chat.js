import { getURL, apiRequest } from '../utils/utils.js'
import { TemplateComponent } from '../utils/TemplateComponent.js'

export class Chat extends TemplateComponent {
    constructor() {
        super()

        this.handleSearchListener = () => this.handleSearch()
        this.receiveMessageListener = (e) => this.receiveMessage(e.detail)
    }

    unmount() {
        const input = this.getRef('input')
        input.removeEventListener('keyup', this.handleSearchListener)
        
        window.removeEventListener('wsMessage', this.receiveMessageListener)
    }

    async componentDidMount() {
        await this.getRooms()

        const input = this.getRef('input')
        input.addEventListener('keyup', this.handleSearchListener)

        window.addEventListener('wsMessage', this.receiveMessageListener)
    }

    async getRooms() {
        try {
            const url = getURL('api/chat/rooms/')
            const rooms = await apiRequest(url)

            const container = this.getRef('rooms')
            rooms.forEach(async (room) => {
                const element = this.displayRoom(room)
                container.appendChild(element)
            })
            
        } catch (error) {
            console.log(error)
        }
    }

    async handleSearch() {
        const value = this.getRef('input').value
        const roomList = this.getRef('rooms')
        const rooms = roomList.children

        for (let room of rooms) {
            const name = room.querySelector('.chatroom-name').textContent
            if (value && !name.includes(value)) {
                room.classList.add('hidden')
            } else {
                room.classList.remove('hidden')
            }
        }
    }

    receiveMessage(event) {
        const message = event.message
        
        if (message && message.action === 'message') {
            const chatRooms = this.getRef('rooms')
            const chatRoom = chatRooms.querySelector(`[data-room-id='${message.room}']`)
            
            const chatRoomMessage = chatRoom.querySelector('.chatroom-message')
            chatRoomMessage.textContent = truncateString(message.content, 48)

            // Modify thhe position of the room
            // to become the first element of the list
            chatRooms.insertBefore(chatRoom, chatRooms.firstChild)
        }
    }

    displayRoom(room) {
        const element = document.createElement('li')
        element.className = 'list-group-item rounded'

        const link = document.createElement('a')
        link.className = 'd-flex align-items-center'
        link.href = `/chat/${room.id}/`
        link.dataset.link = ''

        const imgContainer = document.createElement('div')
        imgContainer.className = 'profile-picture'

        const img = document.createElement('img')
        img.src = room.picture

        const infoContainer = document.createElement('div')
        infoContainer.className = 'd-flex flex-column mx-2'

        const name = document.createElement('span')
        name.className = 'mb-0 chatroom-name'
        name.textContent = room.name

        const message = document.createElement('span')
        if (room.last_message) {
            message.textContent = room.last_message.content
        } else {
            message.textContent = "Send a message..."
        }

        element.appendChild(link)
        link.appendChild(imgContainer)
        imgContainer.appendChild(img)
        link.appendChild(infoContainer)
        infoContainer.appendChild(name)
        infoContainer.appendChild(message)

        return element
    }
}
