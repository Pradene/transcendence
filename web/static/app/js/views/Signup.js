import { AbstractView } from "./AbstractView.js"
import { Router } from "../Router.js"
import { getURL, apiRequest } from "../utils.js"

export class Signup extends AbstractView {
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
                <form method="POST" id="signup-form" class="form">
                    <div class="form-field">
                        <label class="form-label">
                            <input class="form-input" type="text" id="username" required autocomplete="off"></input>
                            <span>Username</span>
                        </label>
                    </div>
                    <div class="form-field">
                        <label class="form-label">
                            <input class="form-input" type="password" id="password" required autocomplete="off"></input>
                            <span>Password</span>
                        </label>
                    </div>
                    <div class="form-field">
                        <label class="form-label">
                            <input class="form-input" type="password" id="password-confirmation" required autocomplete="off"></input>
                            <span>Password</span>
                        </label>
                    </div>
                    <button type="submit">Sign up</button>
                </form>
            </div>
            <div class="container-xs text-center mt-36">
                <a href="/login/" data-link>Login</a>
            </div>
        </div>
        `
    }

    addEventListeners() {
        const inputs = document.querySelectorAll(".form-input")
        
        inputs.forEach(input => {
            input.addEventListener("input", function (event) {
                if (input.value == "") {
                    input.style.transform = "translateY(-50%)"
                    input.nextElementSibling.style.transform = "translateY(-50%) scale(1)"
                
                } else {
                    input.style.transform = "translateY(-20%)"
                    input.nextElementSibling.style.transform = "translateY(-120%) scale(0.75)"
                }
            })
        })

        const form = document.getElementById("signup-form")
        form.addEventListener("submit", (event) => this.handleSubmit(event))
    }

    async handleSubmit(event) {
        event.preventDefault()

        const username = document.getElementById("username")
        const password1 = document.getElementById("password")
        const password2 = document.getElementById("password-confirmation")
        
        const url = getURL("api/users/signup/")

        try {
            await apiRequest(
                url,
                "POST",
                {
                    username: username.value, 
                    password1: password1.value, 
                    password2: password2.value
                }
            )
            
            const router = Router.get()
            router.navigate("/login/")

        } catch (e) {
            username.value = ''
            password1.value = ''
            password2.value = ''

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