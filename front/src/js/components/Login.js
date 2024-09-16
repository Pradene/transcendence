import { TemplateComponent } from "../utils/TemplateComponent.js"
import { WebSocketManager } from "../utils/WebSocketManager.js"
import { getURL, apiRequest, getCSRFToken } from "../utils/utils.js"
import { registerTemplates } from "../utils/Templates.js"
import { Router } from "../utils/Router.js"

export class Login extends TemplateComponent {
    constructor() {
        super()
    }

    async componentDidMount() {
        const form = this.getRef("form")
        form.addEventListener("submit", async (event) => {
            await this.submitLoginRequest(event)
        })

        form.addEventListener("input", (event) => {
            this.inputAnimation(event.target)
        })

		const OAuthButton = this.getRef("ft_auth")
		OAuthButton.addEventListener("click", async (event) => {
			await this.submit42LoginRequest(event)
		})
    }

    async submitLoginRequest(event) {
        event.preventDefault()

        try {
            const username = this.getRef("username")
            const password = this.getRef("password")
            const rememberMe = this.getRef("remember-me")
            const url = getURL("api/users/login/")
        
            const data = await apiRequest(
                url,
                "POST",
                {
                    username: username.value,
                    password: password.value,
                    remember_me: rememberMe.value
                }
            )

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

	async submit42LoginRequest()
	{
		try {
			const token = await getCSRFToken()
			const url = getURL('api/users/ft_auth/')
			
			const response = await fetch(url, {
				method: "POST",
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': token
				}
			})

			const data = await response.json()

            if (data.url) {
                window.location.href = data.url

            } else {
                throw new Error("Couldn't find the API")
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

    inputAnimation(input) {
        if (input.value !== "") {
            input.classList.add("active")
            
        } else {
            input.classList.remove("active")
        }
    }
}

registerTemplates("Login", Login)