import { AbstractView } from "./AbstractView.js"
import { Router } from "../Router.js"

export class Login extends AbstractView {
    constructor() {
        super()
    }

    async getHtml() {
        return `
        <div>
            <form method="POST" id="login-form">
                <label>
                    <input type="text" id="username" required></input>
                    <span>Username</span>
                </label>
                <label>
                    <input type="password" id="password" required></input>
                    <span>Password</span>
                </label>
                <button type="submit">Login</button>
            </form>
            <a data-link>Forgot password?</a>
        </div>
        <div>
            <a data-link>Sign up</a>
        </div>
        `
    }

    addEventListeners() {
        document.getElementById('login-form').addEventListener('submit', async (event) => {
            event.preventDefault()
            await this.handleLogin()
        })
    }

    async handleLogin() {
        const username = document.getElementById("username").value
        const password = document.getElementById("password").value
        const csrfToken = this.getCSRFToken()
        
        try {
            const response = await fetch("http://localhost:8000/api/account/login/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({username, password})
            })
            
            const data = await response.json()
            
            if (data.success) {
                const router = new Router()
                router.navigate('/')

                this.WebSocketConnect()
            
            } else {
                console.log('error: ', data.message)
            }
                
        } catch (error) {
            console.log('error: ', error)
        }
    }

    getCSRFToken() {
        return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    }

    WebSocketConnect() {
        const url = 'ws://localhost:8000/ws/chat/'
        const ws = new WebSocket(url)

        ws.addEventListener('open', (event) => {
            console.log('connect')
        })
    }
}