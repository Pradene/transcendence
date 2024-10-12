import { getURL, apiRequest, getConnectedUserID } from '../utils/utils.js'
import { WebSocketManager } from '../utils/WebSocketManager.js'
import { TemplateComponent } from '../utils/TemplateComponent.js'
import { Router } from '../utils/Router'

export class ChatRoom extends TemplateComponent {
    constructor() {
        super()

        this.sendMessageListener = async (e) => this.sendMessage(e) 
        this.WebsocketMessageListener = (e) => this.WebsocketMessage(e.detail)
        this.sendInvitationListener = async (e) => this.sendInvitation(e)
        this.acceptInvitationListener = async (e) => this.acceptInvitation(e)
        this.refuseInvitationListener = async (e) => this.refuseInvitation(e)
		this.cancelInvitaionListener = async (e) => this.cancelInvitaion(e)
    
        this.roomID = null
    }

    async unmount() {
        await this.cancelAllInvitations()
    
        const form = this.getRef('form')
        form.addEventListener('submit', this.sendMessageListener)

        window.addEventListener('wsMessage', this.WebsocketMessageListener)

        document.querySelector('button.duel-invite').removeEventListener('click', this.sendInvitationListener)
    }

    async componentDidMount() {
        this.roomID = this.getRoomID()

        await this.getMessages()
        
        const form = this.getRef('form')
        form.addEventListener('submit', this.sendMessageListener)
        
        window.addEventListener('wsMessage', this.WebsocketMessageListener)

        const invitationButton = document.querySelector('button.duel-invite')
        invitationButton.addEventListener('click', this.sendInvitationListener)
    
        const messages = this.getRef('messages')
        messages.addEventListener('click', (e) => this.handleInvitationClick(e))
    }

    async WebsocketMessage(event) {
        const message = event.message
        console.log('message:', message)

        if (message.room_id != this.roomID) {
            return

        } else if (message.type === 'message') {
			const container = this.getRef('messages')
            this.displayMessage(container, message)
            
		} else if (message.type === 'invitation') {
            
            if (message.status === 'pending') {
                const container = this.getRef('messages')
				this.displayMessage(container, message)

			} else if (message.status === 'accepted') {
                this.handleInvitationAccepted(message)

				const router = Router.get()
				await router.navigate(`/game/${message.game_id}/`)

			} else if (message.status === 'declined') {
				this.handleInvitationRefused(message)

			} else if (message.status === 'canceled') {
				this.handleInvitationCanceled(message)
			}
	
		}
    }

    handleInvitationClick(e) {
        const target = e.target

        const message = target.closest('div.content')
        if (!message) return

        if (target.classList.contains('accept')) {
            this.acceptInvitation(message)
        } else if (target.classList.contains('decline')) {
            this.refuseInvitation(message)
        } else if (target.classList.contains('cancel')) {
            this.cancelInvitaion(message)
        }
    }

    getInvitationByID(id) {
        return document.querySelector(`[data-invitation-id='${id}']`)
    }

    handleInvitationRefused(message) {
        const invitation = this.getInvitationByID(message.id)
        if (!invitation) return

        const buttons = invitation.querySelector('.flex')
        if (buttons)
            buttons.remove()

        const content = document.createElement('p')
        content.textContent = 'Invitation refused'
        invitation.appendChild(content)
    }

	handleInvitationCanceled(message) {
        const invitation = this.getInvitationByID(message.id)
        if (!invitation) return

        const buttons = invitation.querySelector('.flex')
        if (buttons)
            buttons.remove()

        const content = document.createElement('p')
        content.textContent = 'Invitation canceled'
        invitation.appendChild(content)
    }

    handleInvitationAccepted(message) {
        const invitation = this.getInvitationByID(message.id)
        if (!invitation) return

        const buttons = invitation.querySelector('.flex')
        if (buttons)
            buttons.remove()

        const content = document.createElement('p')
        content.textContent = 'Invitation accepted'
        invitation.appendChild(content)
    }

    async sendMessage(event) {
        event.preventDefault()

        const input = this.getRef('input')
        const value = input.value
        const roomID = this.roomID

        if (input.value != '') {
            const ws = WebSocketManager.get()
            await ws.sendMessage('chat', {
                type: 'send_message',
                room_id: roomID,
                content: value
            })

            input.value = ''
        }
    }

    async sendInvitation(event) {
        event.preventDefault()

        const roomID = this.roomID

        const ws = WebSocketManager.get()
        await ws.sendMessage('chat', {
            type: 'send_invitation',
            room_id: roomID,
			user_id: getConnectedUserID(),
            content: '',
        })
    }

    async acceptInvitation(invitation) {
        const roomID = this.roomID
		const invitation_id = invitation.getAttribute('data-invitation-id')
        
        const ws = WebSocketManager.get()
        await ws.sendMessage('chat', {
            type: 'accept_invitation',
            room_id: roomID,
            invitation_id: invitation_id
        })
    }

    async refuseInvitation(invitation) {
        const roomID = this.roomID
		const invitation_id = invitation.getAttribute('data-invitation-id')
        
        const ws = WebSocketManager.get()
        await ws.sendMessage('chat', {
			type: 'decline_invitation',
            room_id: roomID,
			invitation_id: invitation_id
        })
    }

	async cancelInvitaion(invitation) {
        const roomID = this.roomID
		const invitation_id = invitation.getAttribute('data-invitation-id')
        
        const ws = WebSocketManager.get()
        await ws.sendMessage('chat', {
            type: 'cancel_invitation',
            room_id: roomID,
			invitation_id: invitation_id
        })
    }

    async cancelAllInvitations() {
        const roomID = this.roomID
        console.log(roomID)

        const ws = WebSocketManager.get()
        await ws.sendMessage('chat', {
            type: 'cancel_all_invitations',
            room_id: roomID,
        })
    }

    async getMessages() {
        try {
            const roomID = this.roomID
            const url = getURL(`api/chat/rooms/${roomID}/`)
            const data = await apiRequest(url)

            const messages = data.messages
            const container = this.getRef('messages')
            messages.forEach(message => {
                this.displayMessage(container, message)
            })

        } catch (error) {
            console.log(error)
        }
    }

    
    displayMessage(container, message) {
        if (!message)
            return

        const element = document.createElement('div')
        element.classList.add('message')
        
        if (message.sender.id === getConnectedUserID())
            element.classList.add('right')

        const imgContainer = document.createElement('a')
        imgContainer.href = `/users/${message.sender.id}/`
        imgContainer.className = 'profile-picture'
        imgContainer.dataset.link = ''

        const img = document.createElement('img')
        img.src = message.sender.picture
        
        const messageContainer = document.createElement('div')
        messageContainer.className = 'content'

        if (message.type === 'message') {
            const messageContent = document.createElement('p')
            messageContent.textContent = message.content
            messageContainer.appendChild(messageContent)

        } else if (message.type === 'invitation') {
            messageContainer.dataset.invitationId = message.id
            this.displayInvitation(messageContainer, message)
        }

        const messageTimestamp = document.createElement('span')
        messageTimestamp.textContent = message.elapsed_timestamp

        element.appendChild(imgContainer)
        imgContainer.appendChild(img)
        element.appendChild(messageContainer)
        messageContainer.appendChild(messageTimestamp)

        container.appendChild(element)

        container.scrollTop = container.scrollHeight
    }

    displayInvitation(container, invitation) {
        const status = invitation.status
        
        if (status === 'pending') {
            const buttonContainer = document.createElement('div')
            buttonContainer.className = 'flex'
            
            if (invitation.sender.id === getConnectedUserID()) {
                const cancelButton = document.createElement('button')
                cancelButton.textContent = 'Cancel'
                cancelButton.className = 'button cancel'
                buttonContainer.appendChild(cancelButton)

            } else {
                const acceptButton = document.createElement('button')
                acceptButton.textContent = 'Accept'
                acceptButton.className = 'button accept'

                const declineButton = document.createElement('button')
                declineButton.textContent = 'Decline'
                declineButton.className = 'button decline'
            
                buttonContainer.appendChild(acceptButton)
                buttonContainer.appendChild(declineButton)
            }

            container.appendChild(buttonContainer)
        
        } else if (status === 'accepted') {
            const acceptedMessage = document.createElement('p')
            acceptedMessage.textContent = 'Invitation accepted'
            container.appendChild(acceptedMessage)
            
        } else if (status === 'declined') {
            const declinedMessage = document.createElement('p')
            declinedMessage.textContent = 'Invitation declined'
            container.appendChild(declinedMessage)
            
        } else if (status === 'canceled') {
            const canceledMessage = document.createElement('p')
            canceledMessage.textContent = 'Invitation canceled'
            container.appendChild(canceledMessage)
        }

    }

    getRoomID() {
        return location.pathname.split('/')[2]
    }
}