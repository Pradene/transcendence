import { AbstractView } from "./AbstractView.js"
import { Router } from "../Router.js"
import { getURL, apiRequest } from "../utils.js"
import { WebSocketManager } from "../WebSocketManager.js"

export class Login extends AbstractView {
    constructor() {
        super()
    }

    isProtected() {
        return false
    }

    getHtml() {
        return `
        <div class="container__fullpage">
            <div class="container">
                <form method="POST" id="login__form" class="registration__form">
                    <div id="error" class="registration__form__error hidden"></div>
                    <div class="registration__form__field">
                        <label class="registration__form__label">
                            <input type="text" id="username" required autocomplete="off"></input>
                            <span>Username</span>
                        </label>
                    </div>
                    <div class="registration__form__field">
                        <label class="registration__form__label">
                            <input type="password" id="password" required autocomplete="off"></input>
                            <span>Password</span>
                        </label>
                    </div>
                    <button type="submit">Login</button>
                </form>
            </div>
            <div>
                <a data-link>Forgot password?</a>
            </div>
            <div style="margin-top: 36px;">
                <a href="/signup/" data-link>Sign up</a>
            </div>
        </div>
        `
    }

    initView() {        
        this.addEventListeners(
            document,
            "input",
            (event) => this.inputAnimation(event.target),
            ".registration__form__label input"
        )

        const form = document.getElementById("login__form")
        this.addEventListeners(
            form,
            "submit",
            (event) => this.handleSubmit(event)
        )
    }

    inputAnimation(input) {
        if (input.value == "") {
            input.parentElement.classList.remove("active")
            
        } else {
            input.parentElement.classList.add("active")
        }
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

            console.log(data)

            localStorage.setItem("user_id", data.user_id)
            
            const ws = WebSocketManager.get()
            ws.connect("wss://" + location.hostname + ":" + location.port + "/ws/chat/", "chat")
            ws.connect("wss://" + location.hostname + ":" + location.port + "/ws/friends/", "friends")

            Router.get().navigate("/")
                
        } catch (e) {
            username.value = ""
            password.value = ""
            
            this.displayErrors(e.message)
        }
    }

    displayErrors(error) {
        const container = document.getElementById("error")
        container.classList.remove("hidden")
        container.innerHTML = ""

        const el = document.createElement("p")
        el.innerHTML = `
            ${error}
        `

        container.appendChild(el)
    }
}