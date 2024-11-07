import { getURL, apiRequest, getConnectedUserID } from '../utils/utils.js'
import { WSManager } from '../utils/WebSocketManager.js'
import { TemplateComponent } from '../utils/TemplateComponent.js'
import { Router } from '../utils/Router'
import { Session } from '../utils/Session.js'

export class ChatRoom extends TemplateComponent {
    constructor() {
        super()

        this.invitations = []
        this.translations = {
            en: {
                send: "Send",
                invite: "Invite",
                writingInvite: "Write a message...",
                invitation_sent: "You have invited your opponent to a duel, waiting for a replie...",
                btn_accept: "Accept",
                btn_cancel: "Cancel",
                btn_decline: "Decline",
                invitation_accepted: "Invitation accepted",
                invitation_canceled: "Invitation canceled",
                invitation_declined: "Invitation declined",
                invitation_refused: "Invitation refused"
            },
            de: {
                send: "Senden",
                invite: "Einladen",
                writingInvite: "Schreiben Sie eine Nachricht...",
                invitation_sent: "Sie haben Ihren Gegner zum Duell eingeladen, auf eine Antwort wartend...",
                btn_accept: "Annehmen",
                btn_cancel: "Stornieren",
                btn_decline: "Ablehnen",
                invitation_accepted: "Einladung angenommen",
                invitation_canceled: "Einladung storniert",
                invitation_declined: "Einladung abgelehnt",
                invitation_refused: "Einladung abgelehnt"
            },
            fr: {
                send: "Envoyer",
                invite: "Inviter",
                writingInvite: "Ecrivez un message...",
                invitation_sent: "Vous avez invitez votre ami a un duel, en attente de reponse...",
                btn_accept: "Accepter",
                btn_cancel: "Annuler",
                btn_decline: "Refuser",
                invitation_accepted: "Invitation acceptee",
                invitation_canceled: "Invitation annulee",
                invitation_declined: "Invitation refusee",
                invitation_refused: "Invitation refusee"
            }
        };

        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';

        this.sendMessageListener = async (e) => this.sendMessage(e)
        this.WebsocketMessageListener = (e) => this.WebsocketMessage(e.detail)
        this.sendInvitationListener = async (e) => this.sendInvitation(e)
        this.acceptInvitationListener = async (e) => this.acceptInvitation(e)
        this.refuseInvitationListener = async (e) => this.refuseInvitation(e)
		this.cancelInvitaionListener = async (e) => this.cancelInvitaion(e)

        this.roomID = null
    }

    async unmount() {
        const form = this.getRef('form')
        form.addEventListener('submit', this.sendMessageListener)

        window.addEventListener('chatEvent', this.WebsocketMessageListener)

        document.querySelector('button.duel-invite').removeEventListener('click', this.sendInvitationListener)

        await this.cancelAllInvitations()
    }

    async componentDidMount() {
        this.roomID = this.getRoomID()

        await this.getMessages()

        const form = this.getRef('form')
        form.addEventListener('submit', this.sendMessageListener)

        window.addEventListener('chatEvent', this.WebsocketMessageListener)

        const invitationButton = document.querySelector('button.duel-invite')
        invitationButton.addEventListener('click', this.sendInvitationListener)

        const messages = this.getRef('messages')
        messages.addEventListener('click', (e) => this.handleInvitationClick(e))
        this.setupLanguageButtons();
        this.translatePage();
    }

    setupLanguageButtons() {
        document.querySelectorAll(".lang-button").forEach(button => {
            button.addEventListener("click", (e) => {
                this.currentLanguage = e.target.dataset.lang
                localStorage.setItem('selectedLanguage', this.currentLanguage)
                this.translatePage()
            })
        })
    }

    translatePage() {
        const elements = document.querySelectorAll("[data-translate-key]");
        elements.forEach(el => {
            const key = el.dataset.translateKey;
            if (this.translations[this.currentLanguage][key]) {
                el.textContent = this.translations[this.currentLanguage][key];
            }
            const input = this.getRef("input");
            if (input) {
                input.placeholder = this.translations[this.currentLanguage].writingInvite;
            }
        })
        this.invitations.forEach(({ container, invitation }) => {
            container.innerHTML = '';
            this.displayInvitation(container, invitation);
        });
    }

    async WebsocketMessage(event) {
        const message = JSON.parse(event.data)
		console.log(message.room_id)

        if (message.room_id != this.roomID) {
			console.log('not inside the good room')
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
        content.textContent =  this.translations[this.currentLanguage].invitation_refused
        invitation.appendChild(content)
    }

	handleInvitationCanceled(message) {
        const invitation = this.getInvitationByID(message.id)
        if (!invitation) return

        const buttons = invitation.querySelector('.flex')
        if (buttons)
            buttons.remove()

        const content = document.createElement('p')
        content.textContent =  this.translations[this.currentLanguage].invitation_declined
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

    // Send a message
    async sendMessage(event) {
        event.preventDefault()

        const input = this.getRef('input')
        const value = input.value
        const roomID = this.roomID

        if (input.value != '') {
            WSManager.send('chat', {
                type: 'send_message',
                room_id: roomID,
                content: value
            })

            input.value = ''
        }
    }

    // Send an invitation
    async sendInvitation(event) {
        event.preventDefault()

        const roomID = this.roomID

        WSManager.send('chat', {
            type: 'send_invitation',
            room_id: roomID,
			user_id: Session.getUserID(),
            content: '',
        })
    }

    // Accept a specific invitation
    async acceptInvitation(invitation) {
        const roomID = this.roomID
		const invitation_id = invitation.getAttribute('data-invitation-id')

        WSManager.send('chat', {
            type: 'accept_invitation',
            room_id: roomID,
            invitation_id: invitation_id
        })
    }

    // Refuse a specific invitation
    async refuseInvitation(invitation) {
        const roomID = this.roomID
		const invitation_id = invitation.getAttribute('data-invitation-id')

        WSManager.send('chat', {
			type: 'decline_invitation',
            room_id: roomID,
			invitation_id: invitation_id
        })
    }

    // Cancel a specific invitation
	async cancelInvitaion(invitation) {
        const roomID = this.roomID
		const invitation_id = invitation.getAttribute('data-invitation-id')

        WSManager.send('chat', {
            type: 'cancel_invitation',
            room_id: roomID,
			invitation_id: invitation_id
        })
    }

    // Cancel all pending invitations
    async cancelAllInvitations() {
        const roomID = this.roomID
        console.log(roomID)

        WSManager.send('chat', {
            type: 'cancel_all_invitations',
            room_id: roomID,
        })
    }

    // Get all messages from the server
    // and after display them in the chat
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

    // Display message
    displayMessage(container, message) {
		console.log('display')
        if (!message)
            return

        const element = document.createElement('div')
        element.classList.add('message')

        if (message.sender.id === Session.getUserID())
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

    // Display the invitation based on her status
    displayInvitation(container, invitation) {
        const status = invitation.status

        const existingInvitation = this.invitations.find(
            item => item.invitation.id === invitation.id
        );
        if (!existingInvitation) {
            this.invitations.push({ container, invitation });
        }

        if (status === 'pending') {
            const buttonContainer = document.createElement('div')
            buttonContainer.className = 'flex'

            if (invitation.sender.id === Session.getUserID()) {
                const cancelButton = document.createElement('button')
                cancelButton.textContent = this.translations[this.currentLanguage].btn_cancel
                cancelButton.className = 'button cancel'
                buttonContainer.appendChild(cancelButton)

            } else {
                const acceptButton = document.createElement('button')
                acceptButton.textContent = this.translations[this.currentLanguage].btn_accept
                acceptButton.className = 'button accept'

                const declineButton = document.createElement('button')
                declineButton.textContent = this.translations[this.currentLanguage].btn_decline
                declineButton.className = 'button decline'

                buttonContainer.appendChild(acceptButton)
                buttonContainer.appendChild(declineButton)
            }

            container.appendChild(buttonContainer)

        } else if (status === 'accepted') {
            const acceptedMessage = document.createElement('p')
            acceptedMessage.textContent = this.translations[this.currentLanguage].invitation_accepted
            container.appendChild(acceptedMessage)

        } else if (status === 'declined') {
            const declinedMessage = document.createElement('p')
            declinedMessage.textContent = this.translations[this.currentLanguage].invitation_declined
            container.appendChild(declinedMessage)

        } else if (status === 'canceled') {
            const canceledMessage = document.createElement('p')
            canceledMessage.textContent =  this.translations[this.currentLanguage].invitation_canceled
            container.appendChild(canceledMessage)
        }

    }

    // Utility function to get the room id from the url
    getRoomID() {
        return location.pathname.split('/')[2]
    }
}
