import { AbstractView } from "./AbstractView.js"
import { Router } from "../Router.js"
import { getURL, apiRequest, updateCSRFToken } from "../utils.js"
import { WebSocketManager } from "../ChatWebSocket.js"

export class Login extends AbstractView {
    constructor() {
        super()
    }

    isProtected() {
        return false
    }

    getHtml() {
        return `
        <div class="container--fullpage">
            <div class="container-xs">
                <div id="error"></div>
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
        `
    }

    addEventListeners() {
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
        form.addEventListener('submit', (event) => this.handleSubmit(event))
    }

    async handleSubmit(event) {
        event.preventDefault()

        const username = document.getElementById("username")
        const password = document.getElementById("password")
        const url = getURL("api/users/login/")
        
        try {
            const data = await apiRequest(
                url,
                "POST",
                {
                    username: username.value,
                    password: password.value
                }
            )

            localStorage.setItem('access', data.access)
            localStorage.setItem('refresh', data.refresh)
            
            const ws = WebSocketManager.get()
            ws.connect('wss://' + location.hostname + ':' + location.port + '/ws/chat/')

            await updateCSRFToken()
            
            const router = Router.get()
            router.navigate('/')
                
        } catch (e) {
            username.value = ""
            password.value = ""
            
            this.displayErrors(e.message)
        }
    }

    displayErrors(error) {
        const container = document.getElementById("error")
        container.innerHTML = ""

        const el = document.createElement('div')
        el.innerHTML = `
            <p>${error}</p>
        `

        container.appendChild(el)
    }
}