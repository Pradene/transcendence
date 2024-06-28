import { AbstractView } from "./AbstractView.js"
import { Router } from "../Router.js"
import { WebSocketManager } from "../ChatWebSocket.js"

export class Login extends AbstractView {
    constructor() {
        super()
    }

    async getHtml() {
        return `
        <div class="container--xs">
            <form method="POST" id="login-form" class="form">
                <div class="form--field">
                    <label class="form--label">
                        <input class="form--input" type="text" id="username" required autocomplete="off"></input>
                        <span>Username</span>
                    </label>
                </div>
                <div class="form--field">
                    <label class="form--label">
                        <input class="form--input" type="password" id="password" required autocomplete="off"></input>
                        <span>Password</span>
                    </label>
                </div>
                <button type="submit">Login</button>
            </form>
            <div class="text--center mt-36">
                <a data-link>Forgot password?</a>
            </div>
        </div>
        <div class="container--xs text--center mt-36">
            <a data-link>Sign up</a>
        </div>
        `
    }

    addEventListeners() {

        const inputs = document.querySelectorAll('.form--input')
        inputs.forEach(input => {
            input.addEventListener('input', function (event) {
                if (input.value == '') {
                    input.style.transform = "translateY(-50%)"
                    input.nextElementSibling.style.transform = "translateY(-50%) scale(1)"
                
                } else {
                    input.style.transform = "translateY(-20%)"
                    input.nextElementSibling.style.transform = "translateY(-120%) scale(0.75)"
                }
        
            })
        })

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
                
                const ws = new WebSocketManager("ws://localhost:8000/ws/chat/")
                window.wsManager = ws

                router.navigate('/')

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
}