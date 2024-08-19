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
        <div class="container__fullpage">
            <div class="container">
                <form method="POST" id="signup__form" class="registration__form">
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
                    <div class="registration__form__field">
                        <label class="registration__form__label">
                            <input type="password" id="password-confirmation" required autocomplete="off"></input>
                            <span>Password</span>
                        </label>
                    </div>
                    <button type="submit">Sign up</button>
                </form>
            </div>
            <div style="margin-top: 36px;">
                <a href="/login/" data-link>Login</a>
            </div>
        </div>
        `
    }

    initView() {
        const inputs = document.querySelectorAll(".registration__form__label input")
        
        inputs.forEach(input => {
            input.addEventListener("input", function () {
                if (input.value == "") {
                    input.style.transform = "translateY(-50%)"
                    input.nextElementSibling.style.transform = "translateY(-50%) scale(1)"
                
                } else {
                    input.style.transform = "translateY(-20%)"
                    input.nextElementSibling.style.transform = "translateY(-120%) scale(0.75)"
                }
            })
        })

        const form = document.getElementById("signup__form")
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

            Router.get().navigate("/login/")

        } catch (e) {
            username.value = ''
            password1.value = ''
            password2.value = ''

            this.displayErrors(e.message)
        }
    }

    displayErrors(error) {
        const container = document.getElementById("error")
        container.classList.remove("hidden")
        container.innerHTML = ""

        const el = document.createElement('p')
        el.innerHTML = `${error}`

        container.appendChild(el)
    }
}