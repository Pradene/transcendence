import { TemplateComponent } from "../utils/TemplateComponent.js"
import { getURL, apiRequest } from "../utils/utils.js"
import { Router } from "../utils/Router.js"

export class Signup extends TemplateComponent {
    constructor() {
        super()

        this.handleSubmitListener = async (e) => await this.handleSubmit(e)
    }

    unmount() {
        const form = this.getRef("form")
        form.removeEventListener("submit", this.handleSubmitListener)
    }

    async componentDidMount() {
        const form = this.getRef("form")
        form.addEventListener("submit", this.handleSubmitListener)
    }

    async handleSubmit(event) {
        event.preventDefault()

		const email = this.getRef("email")
		const username = this.getRef("username")
		const password = this.getRef("password")
		const passwordConfirmation = this.getRef("passwordConfirmation")

		
        try {
            const url = getURL("api/auth/signup/")
        
            const data = await apiRequest(
                url,
                "POST",
                {
					email: email.value,
                    username: username.value,
                    password: password.value,
                    password_confirmation: passwordConfirmation.value
                }
            )

            const router = Router.get()
            await router.navigate("/login/")
                
        } catch (e) {
            email.value = ""
            username.value = ""
            password.value = ""
            passwordConfirmation.value = ""
            
            email.classList.remove("active")
            username.classList.remove("active")
            password.classList.remove("active")
            passwordConfirmation.classList.remove("active")
            
            this.displayErrors(e.message)
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