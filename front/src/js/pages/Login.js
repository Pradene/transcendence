import { TemplateComponent } from "../utils/TemplateComponent.js"
import { WebSocketManager } from "../utils/WebSocketManager.js"
import { getURL, apiRequest, getCSRFToken } from "../utils/utils.js"
import { Router } from "../utils/Router.js"


export class Login extends TemplateComponent {
    constructor() {
        super()
        
        this.submit42LoginRequestListener = async (e) => await this.submit42LoginRequest(e)
        this.submitLoginRequestListener = async (e) => await this.submitLoginRequest(e)
    }
    
    async unmount() {
        const form = this.getRef("form")
        form.removeEventListener("submit", this.submitLoginRequestListener)
        
        const OAuthButton = this.getRef("ft_auth")
        OAuthButton.removeEventListener("click", this.submit42LoginRequestListener)
    }

    async componentDidMount() {
        const form = this.getRef("form")
        form.addEventListener("submit", this.submitLoginRequestListener)

        const OAuthButton = this.getRef("ft_auth")
        OAuthButton.addEventListener("click", this.submit42LoginRequestListener)
    }

    async submitLoginRequest(event) {
        event.preventDefault()

        const username = this.getRef("username")
        const password = this.getRef("password")
        const rememberMe = this.getRef("remember-me")
        const url = getURL("api/auth/login/")

        try {
            const data = await apiRequest(url, {
                method: "POST",
                body: {
                    username: username.value,
                    password: password.value,
                    remember_me: rememberMe.value
                }
            })

            const router = Router.get()
            await router.navigate("/verify-otp/")

        } catch (e) {
            username.value = ""
            password.value = ""

            username.classList.remove("active")
            password.classList.remove("active")

            this.displayErrors(e.message)
        }
    }

    async submit42LoginRequest() {
        try {
            const url = getURL("api/auth/ft_auth/")
            const data = await apiRequest(url)

            if (data.url) {
                window.location.href = data.url

            } else {
                throw new Error("Couldn't redirect to external API")
            }

        } catch (e) {
            console.log(e)
        }
    }

    displayErrors(error) {
        const container = this.getRef("error")
        container.classList.remove("hidden")

        const el = document.createElement("p")
        el.textContent = error
        container.replaceChildren(el)
    }
}
