import { AbstractView } from "./AbstractView.js"
import { Router } from "../Router.js"

export class Profile extends AbstractView {
    constructor() {
        super()

        this.logout = this.logout.bind(this)
    }

    getHtml() {
        return `
        <nav-component></nav-component>
        <h1>Profile</h1>
        <button>Logout</button>
        `
    }

    async addEventListeners() {
        const button = document.querySelector('button')
        button.addEventListener('click', this.logout)
    }

    async logout() {
        try {
            const response = await fetch(`/api/user/logout/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                }
            })

            const data = await response.json()

            if (data.success) {
                localStorage.removeItem('isAuthenticated')
                localStorage.removeItem('username')
                const router = Router.get()
                router.navigate('/login/')

            } else {
                console.log('Failed to fetch data:', data.error)
            }
        } catch (error) {

        }
    }
}