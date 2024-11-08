import { TemplateComponent } from '../utils/TemplateComponent.js'
import { getURL, apiRequest } from '../utils/utils.js'
import { Router } from '../utils/Router.js'
import { connectChatSocket } from '../websockets/Chat.js'
import { connectFriendsSocket } from '../websockets/Friends.js'

export class Login extends TemplateComponent {
    constructor() {
        super()
        
        this.submit42LoginRequestListener = async (e) => await this.submit42LoginRequest(e)
        this.submitLoginRequestListener = async (e) => await this.submitLoginRequest(e)
    }
    
    async unmount() {
        const form = this.getRef('form')
        form.removeEventListener('submit', this.submitLoginRequestListener)
        
        const OAuthButton = this.getRef('ft_auth')
        OAuthButton.removeEventListener('click', this.submit42LoginRequestListener)
    }

    async componentDidMount() {
        const form = this.getRef('form')
        form.addEventListener('submit', this.submitLoginRequestListener)

        const OAuthButton = this.getRef('ft_auth')
        OAuthButton.addEventListener('click', this.submit42LoginRequestListener)
    }

    async submitLoginRequest(event) {
        event.preventDefault()

        const username = document.getElementById('username')
        const password = document.getElementById('password')
        const rememberMe = document.getElementById('remember-me')
        const url = getURL('api/auth/login/')

        try {
            const data = await apiRequest(url, {
                method: 'POST',
                body: {
                    username: username.value,
                    password: password.value,
                    remember_me: rememberMe.value
                }
            })

            const router = Router.get()
            if (data['2fa_enabled']) {
                await router.navigate("/verify-otp/")

            } else {
                connectChatSocket()
                connectFriendsSocket()

                await router.navigate("/")
            }

        } catch (e) {
            username.value = ''
            password.value = ''

            this.displayErrors(e.message)
        }
    }

    async submit42LoginRequest() {
        try {
            const url = getURL('api/auth/ft_auth/')
            const data = await apiRequest(url)

            if (data.url) {
                window.location.href = data.url

            } else {
                throw new Error(`Couldn't redirect to external API`)
            }

        } catch (e) {
            console.log(e)
        }
    }

    displayErrors(error) {
        console.log('Login error:', error)

        const fields = document.querySelectorAll('.input')

        Array.from(fields).forEach(field => {
            console.log(field)

            const el = field.querySelector('label')
            el.classList.remove('hidden')
        })
    }
}
