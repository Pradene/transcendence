import { TemplateComponent } from "../utils/TemplateComponent.js"
import { WebSocketManager } from "../utils/WebSocketManager.js"
import { getURL, apiRequest, getCSRFToken } from "../utils/utils.js"
import { Router } from "../utils/Router.js"


export class Login extends TemplateComponent {
    constructor() {
        super()
        
        this.submit42LoginRequestListener = async (e) => await this.submit42LoginRequest(e)
        this.submitLoginRequestListener = async (e) => await this.submitLoginRequest(e)
    
        this.ball = undefined
    }
    
    async unmount() {
        const form = this.getRef("form")
        form.removeEventListener("submit", this.submitLoginRequestListener)
        
        const OAuthButton = this.getRef("ft_auth")
        OAuthButton.removeEventListener("click", this.submit42LoginRequestListener)
        
        this.ball.remove()
    }

    async componentDidMount() {
        const form = this.getRef("form")
        form.addEventListener("submit", this.submitLoginRequestListener)

        const OAuthButton = this.getRef("ft_auth")
        OAuthButton.addEventListener("click", this.submit42LoginRequestListener)
        this.addBouncingBall()
    }

    addBouncingBall() {
        this.ball = document.getElementById('dynamic-elements')

        if (!this.ball) {
            this.ball = document.createElement('div')
            document.body.appendChild(this.ball)
        }

        const ball = document.createElement('div')
        ball.id = 'ball'
        ball.style.position = 'absolute'
        ball.style.width = '15px'
        ball.style.height = '15px'
        ball.style.backgroundColor = 'white'
        ball.style.borderRadius = '50%'
        ball.style.zIndex = '-1'

        const title = document.createElement('div')
        title.style.position = 'fixed'
        title.style.color = 'white'
        title.style.fontSize = '24px'
        title.style.top = '5px'
        title.style.left = '50%'
        title.style.transform = 'translateX(-50%)'
        title.innerHTML = 'Pong'

        const score = document.createElement('div')
        score.style.position = 'fixed'
        score.style.color = 'white'
        score.style.fontSize = '24px'
        score.style.top = '35px'
        score.style.left = '50%'
        score.style.transform = 'translateX(-50%)'

        this.ball.appendChild(ball)
        this.ball.appendChild(title)
        this.ball.appendChild(score)

        let left = 0
        let right = 0

        let posX = window.innerWidth / 2
        let posY = window.innerHeight / 2
        let velocityX = 3
        let velocityY = 3

        function moveBall() {
            posX += velocityX
            posY += velocityY

            if (posY <= 3 || posY + ball.offsetHeight + 3 >= window.innerHeight - 1) {
                velocityY *= -1;
            }
            if (posX + ball.offsetWidth + 3 >= window.innerWidth) {
                ++left
                velocityX *= -1
            }
            if (posX <= 3) {
                ++right
                velocityX *= -1
            }

            ball.style.left = posX + 'px'
            ball.style.top = posY + 'px'
            score.innerHTML = `${left} - ${right}`

            requestAnimationFrame(moveBall)
        }

        moveBall()
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
