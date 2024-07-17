import { AbstractView } from "./AbstractView.js"
import { Router } from "../Router.js"
import { getCSRFToken, updateCSRFToken } from "../utils.js"
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
        const access = localStorage.getItem('access')
        const refresh = localStorage.getItem('refresh')
        const csrfToken = getCSRFToken()
        
        try {
            const response = await fetch("/api/user/logout/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`,
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ refresh })
            })

            
            if (response.ok) {
                localStorage.removeItem('access')
                localStorage.removeItem('refresh')
                
                const ws = WebSocketManager.get()
                ws.disconnect()

                updateCSRFToken()

                const router = Router.get()
                router.navigate('/login/')

            } else {
                console.log('error: Failed to fetch data')
            }

        } catch (error) {
            console.log(error)
        }
    }
}