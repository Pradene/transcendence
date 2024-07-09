import { AbstractView } from "./AbstractView.js"
import { Router } from "../Router.js"
import { getCSRFToken } from "../utils.js"
import { WebSocketManager } from "../ChatWebSocket.js"

export class Profile extends AbstractView {
    constructor() {
        super()

        this.logout = this.logout.bind(this)
    }

    getHtml() {
        return `
        <nav-component></nav-component>
        <h1>Profile</h1>
        <button id='logout'>Logout</button>
        `
    }

    async addEventListeners() {
        const button = document.getElementById('logout')
        button.addEventListener('click', this.logout)
    }

    async logout() {
        const token = localStorage.getItem('token')
        const csrfToken = getCSRFToken()

        console.log('logout')
        console.log(csrfToken)
        
        try {
            const response = await fetch("/api/user/logout/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-CSRFToken': csrfToken
                }
            })

            const data = await response.json()

            if (data.success) {
                localStorage.removeItem('token')
                
                const ws = WebSocketManager.get()
                ws.disconnect()

                const router = Router.get()
                router.navigate('/login/')

            } else {
                console.log('Failed to fetch data:', data.error)
            }

        } catch (error) {
            console.log(error)
        }
    }
}