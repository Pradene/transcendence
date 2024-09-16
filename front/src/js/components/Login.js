import { TemplateComponent } from "../utils/TemplateComponent.js"
import { WebSocketManager } from "../utils/WebSocketManager.js"
import { getURL, apiRequest } from "../utils/utils.js"
import { registerTemplates } from "../utils/Templates.js"
import { Router } from "../utils/Router.js"

export class Login extends TemplateComponent {
    constructor() {
        super()
        this.animationFrameId = null
    }

    async componentDidMount() {
        const form = this.getRef("form")
        form.addEventListener("submit", async (event) => {
            await this.handleSubmit(event)
        })

        form.addEventListener("input", (event) => {
            this.inputAnimation(event.target)
        })
        this.addBouncingBall()
    }

    componentWillUnmount() {
    console.log("Cleaning up...")
    const ball = document.getElementById('ball')
    const score = document.getElementById('score')
    if (ball)
        ball.remove()
    if (score)
        score.remove()
    if (this.animationFrameId)
        cancelAnimationFrame(this.animationFrameId)
    }

    addBouncingBall() {

        const ball = document.createElement('div')
        ball.id = 'ball'
        ball.style.position = 'absolute'
        ball.style.width = '15px'
        ball.style.height = '15px'
        ball.style.backgroundColor = 'white'
        ball.style.borderRadius = '50%'
        ball.style.zIndex = '-1'


        const score = document.createElement('div')
        score.style.position = 'fixed'
        score.style.color = 'white'
        score.style.fontSize = '24px'
        score.style.top = '10px'
        score.style.left = '50%'
        score.style.transform = 'translateX(-50%)'


        let left = 0
        let right = 0

        document.body.appendChild(ball)
        document.body.appendChild(score)

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
        this.animationFrameId = requestAnimationFrame(moveBall)
    }

    async handleSubmit(event) {
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
