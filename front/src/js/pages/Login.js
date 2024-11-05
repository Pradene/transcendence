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

        this.translations = {
            en: {
                hello: "Hello,",
                welcome_message: "We are happy to see you",
                username_placeholder: "Username",
                password_placeholder: "Password",
                remember_me: "Remember me",
                forgot_password: "Forgot password?",
                login_button: "Login",
                login_42: "Login with 42",
                no_account: "Doesn't have account yet?&nbsp;<a href='/signup/'>Sign up</a>"

            },
            de: {
                hello: "Hallo,",
                welcome_message: "Wir freuen uns, Sie zu sehen",
                username_placeholder: "Benutzername",
                password_placeholder: "Passwort",
                remember_me: "Angemeldet bleiben",
                forgot_password: "Passwort vergessen?",
                login_button: "Anmelden",
                login_42: "Mit 42 Anmelden",
                no_account: "Hat noch kein Konto?&nbsp;<a href='/signup/'> Benutzerkonto erstellen</a>"
            },
            fr: {
                hello: "Bonjour,",
                welcome_message: "Nous sommes heureux de vous voir",
                username_placeholder: "Nom d'utilisateur",
                password_placeholder: "Mot de passe",
                remember_me: "Se souvenir de moi",
                forgot_password: "Mot de passe oublié?",
                login_button: "Se connecter",
                login_42: "Se connecter avec 42",
                no_account: "Pas encore de compte?&nbsp;<a href='/signup/'>S'inscrire</a>"
            }
        };

        this.currentLanguage = localStorage.getItem('selectedLanguage') || "en";
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

    unmount() {
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

        this.setupLanguageButtons();
        this.translatePage();
        this.addBouncingBall()
    }

    setupLanguageButtons() {
        document.querySelectorAll(".lang-button").forEach(button => {
            button.addEventListener("click", (e) => {
                this.currentLanguage = e.target.dataset.lang;

                localStorage.setItem('selectedLanguage', this.currentLanguage);

                this.translatePage();
            });
        });
    }

    translatePage() {
        const elements = document.querySelectorAll("[data-translate-key]");
        elements.forEach(el => {
            const key = el.dataset.translateKey;
            el.innerHTML = this.translations[this.currentLanguage][key];
        });

        this.getRef("username").placeholder = this.translations[this.currentLanguage].username_placeholder;
        this.getRef("password").placeholder = this.translations[this.currentLanguage].password_placeholder;
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
            if (data['2fa_enabled'])
                await router.navigate("/verify-otp/")
            else
                await router.navigate("/")
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
