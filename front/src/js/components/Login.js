import { TemplateComponent } from "../utils/TemplateComponent.js"
import { WebSocketManager } from "../utils/WebSocketManager.js"
import { getURL, apiRequest } from "../utils/utils.js"
import { registerTemplates } from "../utils/Templates.js"
import { Router } from "../utils/Router.js"

export class Login extends TemplateComponent {
    constructor() {
        super()
    }

    async componentDidMount() {
        const form = this.getRef("form")
        form.addEventListener("submit", async (event) => {
            await this.handleSubmit(event)
        })

        form.addEventListener("input", (event) => {
            this.inputAnimation(event.target)
        })

		const OAuthButton = this.getRef("ft_auth")
		OAuthButton.addEventListener("click", async (event) => {
			await this.handle_ft_auth(event)
		})
    }

    async handleSubmit(event) {
        event.preventDefault()

        try {
            const username = this.getRef("username")
            const password = this.getRef("password")
            const url = getURL("api/users/login/")
        
            const data = await apiRequest(
                url,
                "POST",
                {
                    username: username.value,
                    password: password.value
                }
            )

            // const ws = WebSocketManager.get()
            // ws.connect("wss://" + location.hostname + ":" + location.port + "/ws/chat/", "chat")
            // ws.connect("wss://" + location.hostname + ":" + location.port + "/ws/friends/", "friends")

            const router = Router.get()
            router.navigate("/verify-otp/")

        } catch (e) {
            username.value = ""
            password.value = ""
            
            username.classList.remove("active")
            password.classList.remove("active")
            
            this.displayErrors(e.message)
        }
    }

	async handle_ft_auth(event)
	{
		event.preventDefault()
		console.log('ma bite')
		
		try {
			const url = getURL('api/users/ft_auth/')
			const response = await fetch(url, )

			console.log(data)
			
			const router = Router.get()
			router.navigate(url)
		
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

    inputAnimation(input) {
        if (input.value !== "") {
            input.classList.add("active")
            
        } else {
            input.classList.remove("active")
        }
    }
}

registerTemplates("Login", Login)