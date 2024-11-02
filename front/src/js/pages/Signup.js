import { TemplateComponent } from '../utils/TemplateComponent.js'
import { getURL, apiRequest } from '../utils/utils.js'
import { Router } from '../utils/Router.js'

export class Signup extends TemplateComponent {
    constructor() {
        super()
        
        this.handleSubmitListener = async (e) => await this.handleSubmit(e)
    }
    
    async unmount() {
        const form = this.getRef('form')
        form.removeEventListener('submit', this.handleSubmitListener)        
    }

    async componentDidMount() {
        const form = this.getRef('form')
        form.addEventListener('submit', this.handleSubmitListener)        
    }

    async handleSubmit(event) {
        event.preventDefault()

		const email = document.getElementById('email')
		const username = document.getElementById('username')
		const password = document.getElementById('password')
		const passwordConfirmation = document.getElementById('passwordConfirmation')


        try {
            const url = getURL('api/auth/signup/')

            const data = await apiRequest(url, {
                method: 'POST',
                body: {
                    email: email.value,
                    username: username.value,
                    password: password.value,
                    password_confirmation: passwordConfirmation.value
                }
            })

            const router = Router.get()
            await router.navigate('/login/')

        } catch (e) {
            email.value = ''
            username.value = ''
            password.value = ''
            passwordConfirmation.value = ''

            this.displayErrors(e.message)
        }
    }

    displayErrors(error) {
        console.log('Login error:', error)

        const fields = document.querySelectorAll('.input')

        Array.from(fields).forEach(field => {
            const el = field.querySelector('label')
            el.classList.remove('hidden')
        })
    }
}
