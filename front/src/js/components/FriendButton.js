import { createElement } from "../utils/createElement.js"
import { TemplateComponent } from "../utils/TemplateComponent.js"
import { WebSocketManager } from "../utils/WebSocketManager.js"

export class FriendButton extends TemplateComponent {
    constructor() {
        super()
    }

    initState() {
        let initialState

        switch (this.props.status) {
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

    create() {
        this.initState()

        const button = createElement("button", {
            attributes: { id: "friend__button" },
            classes: ["button"],
            textContent: this.state.label
        })

        return button
    }

    componentDidMount() {
        this.addEventListeners(
            this.element,
            "click",
            () => this.handleClick()
        )
    }

    handleClick() {
        switch (this.state.currentState) {
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