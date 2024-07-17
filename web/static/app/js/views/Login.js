import { AbstractView } from "./AbstractView.js"
import { Router } from "../Router.js"
import { getCSRFToken, updateCSRFToken } from "../utils.js"
import { WebSocketManager } from "../ChatWebSocket.js"

export class Login extends AbstractView {
    constructor() {
        super()

        this.handleSubmit = this.handleSubmit.bind(this)
    }

    isProtected() {
        return false
    }

    getHtml() {
        return `
        <div class="fp">
            <div>
                <div class="container-xs">
                    <form method="POST" id="login-form" class="form">
                        <div class="form-field">
                            <label class="form-label">
                                <input class="form-input" type="text" id="username" required autocomplete="off"></input>
                                <span>Username</span>
                                <div class="error"></div>
                            </label>
                        </div>
                        <div class="form-field">
                            <label class="form-label">
                                <input class="form-input" type="password" id="password" required autocomplete="off"></input>
                                <span>Password</span>
                                <div class="error"></div>
                            </label>
                        </div>
                        <button type="submit">Login</button>
                    </form>
                    <div class="text-center mt-36">
                        <a data-link>Forgot password?</a>
                    </div>
                </div>
                <div class="container-xs text-center mt-36">
                    <a href='/signup/' data-link>Sign up</a>
                </div>
            </div>
        </div>
        `
    }

    async addEventListeners() {

        const inputs = document.querySelectorAll('.form-input')
        inputs.forEach(input => {
            input.addEventListener('input', function () {
                if (input.value == '') {
                    input.style.transform = "translateY(-50%)"
                    input.nextElementSibling.style.transform = "translateY(-50%) scale(1)"
                
                } else {
                    input.style.transform = "translateY(-20%)"
                    input.nextElementSibling.style.transform = "translateY(-120%) scale(0.75)"
                }
        
            })
        })

        const form = document.getElementById('login-form')
        form.addEventListener('submit', this.handleSubmit)
    }

    async handleSubmit(event) {
        event.preventDefault()

        const username = document.getElementById("username").value
        const password = document.getElementById("password").value
        const csrfToken = getCSRFToken()
        
        try {
            const response = await fetch("/api/user/login/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({username, password})
            })
            
            if (response.ok) {
                const data = await response.json()
                localStorage.setItem('access', data.access)
                localStorage.setItem('refresh', data.refresh)

                const ws = WebSocketManager.get()
                ws.connect('wss://localhost:3000/ws/chat/')

                updateCSRFToken()

                const router = Router.get()
                router.navigate('/')

            } else {
                console.log('error: Failed to fetch data')
            }
                
        } catch (error) {
            console.log('error: ', error)
        }
    }
}