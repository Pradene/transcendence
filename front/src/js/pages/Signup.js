import { TemplateComponent } from "../utils/TemplateComponent.js"
import { getURL, apiRequest } from "../utils/utils.js"
import { Router } from "../utils/Router.js"

export class Signup extends TemplateComponent {
    constructor() {
        super()
        
        this.handleSubmitListener = async (e) => await this.handleSubmit(e)
        this.ball = undefined
    }
    
    unmount() {
        const form = this.getRef("form")
        form.removeEventListener("submit", this.handleSubmitListener)
        
        this.ball.remove()
    }

    async componentDidMount() {
        const form = this.getRef("form")
        form.addEventListener("submit", this.handleSubmitListener)
        
        this.addBouncingBall()
    }

    addBouncingBall() {
        this.ball = document.getElementById('dynamic-elements')

        if (!this.ball) {
            this.ball = document.createElement('div')
            this.ball.id = 'dynamic-elements'
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
