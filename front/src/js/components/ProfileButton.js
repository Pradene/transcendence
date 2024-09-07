import { Router } from "../utils/Router.js"
import { TemplateComponent } from "../utils/TemplateComponent.js"
import { registerTemplates } from "../utils/Templates.js"
import { getUserID } from "../utils/utils.js"
import { WebSocketManager } from "../utils/WebSocketManager.js"

export class ProfileButton extends TemplateComponent {
    constructor() {
        super()

        this.state = {}
    }

    async render(status) {
        await this.parseTemplate()
        await this.componentDidMount(status)

        return this.container
    }

    async componentDidMount(status) {
        this.initState(status)

        const button = this.getRef("button")
        button.textContent = this.state.label

        button.addEventListener("click", () => this.handleClick())
    }

    initState(status) {
        let initialState

        switch (status) {
            case 'self':
                initialState = { currentState: 'self', label: 'Edit profile' }
                break
            case 'friend':
                initialState = { currentState: 'friend', label: 'Remove friend' }
                break
            case 'request_sent':
                initialState = { currentState: 'request_sent', label: 'Cancel' }
                break
            case 'request_received':
                initialState = { currentState: 'request_received', label: 'Accept' }
                break
            case 'none':
            default:
                initialState = { currentState: 'none', label: 'Add friend' }
                break
        }

        this.state = initialState
    }

    handleClick() {
        switch (this.state.currentState) {
            case 'self':
                const id = getUserID()
                const router = Router.get()
                router.navigate(`/users/${id}/edit/`)
                break
            case 'friend':
                // Handle unfriending
                this.setState({ currentState: 'none', label: 'Add friend' })
                break
            case 'request_sent':
                // Handle canceling the request
                this.setState({ currentState: 'none', label: 'Add friend' })
                this.cancelIncomingFriendRequest()
                break
            case 'request_received':
                // Handle accepting the request
                this.setState({ currentState: 'friend', label: 'Remove friend' })
                this.acceptIncomingFriendRequest()
                break
            case 'none':
                // Handle sending a new friend request
                this.setState({ currentState: 'request_sent', label: 'Cancel' })
                this.sendFriendRequest()
                break
        }
    }

    async acceptIncomingFriendRequest() {
        const ws = WebSocketManager.get()

        await ws.sendMessage('friends', {
            'type': 'friend_request_accepted',
            'sender': this.props.id
        })
    }

    async cancelIncomingFriendRequest() {
        const ws = WebSocketManager.get()

        await ws.sendMessage('friends', {
            'type': 'friend_request_cancelled',
            'receiver': this.props.id
        })
    }

    async declineIncomingFriendRequest() {
        const ws = WebSocketManager.get()

        await ws.sendMessage('friends', {
            'type': 'friend_request_declined',
            'sender': this.props.id
        })
    }

    async sendFriendRequest() {
        const ws = WebSocketManager.get()

        await ws.sendMessage('friends', {
            'type': 'friend_request_sended',
            'receiver': this.props.id
        })
    }

    async removeFriend() {
        const ws = WebSocketManager.get()

        await ws.sendMessage("friends", {
            "type": "remove_friend",
            'user_id': this.props.id
        })
    }
}

registerTemplates("ProfileButton", ProfileButton)