import { AbstractView } from "./AbstractView.js"
import { Router } from "../Router.js"
import { getCSRFToken } from "../utils.js"

export class Signup extends AbstractView {
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
                    <a href='/login/' data-link>Login</a>
                </div>
            </div>
        </div>
        `
    }

    async addEventListeners() {

        const inputs = document.querySelectorAll('.form-input')
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

        const form = document.getElementById('signup-form')
        form.addEventListener('submit', this.handleSubmit)
    }

    async handleSubmit(event) {
        event.preventDefault()

        const username = document.getElementById('username').value
        const password1 = document.getElementById('password').value
        const password2 = document.getElementById('password-confirmation').value
        
        const csrfToken = getCSRFToken()

        try {
            const response = await fetch("/api/user/signup/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({username, password1, password2})
            })

            if (response.ok) {
                const router = Router.get()

                router.navigate('/login/')

            } else {
                console.log('error: Failed to fetch data')
            }
                
        } catch (error) {
            console.log('error: ', error)
        }
    }
}