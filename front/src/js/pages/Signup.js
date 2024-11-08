import { TemplateComponent } from '../utils/TemplateComponent.js'
import { getURL, apiRequest } from '../utils/utils.js'
import { Router } from '../utils/Router.js'

export class Signup extends TemplateComponent {
    constructor() {
        super()

        this.handleSubmitListener = async (e) => await this.handleSubmit(e)
        this.translations = {
            en: {
                hello: "Hello,",
                welcome_message: "We are happy to see you",
                username_placeholder: "Username",
                email_placeholder: "Email",
                password_placeholder: "Password",
                passwordconfirmation_placeholder: "Password Confirmation",
                Signup_button: "Sign up",
               already_registered: "Already registered?&nbsp;<a href='/login/'>Login</a>"
            },
            de: {
                hello: "Hallo,",
                welcome_message: "Wir freuen uns, Sie zu sehen",
                username_placeholder: "Benutzername",
                email_placeholder: "Email",
                password_placeholder: "Passwort",
                passwordconfirmation_placeholder: "Passwort Bestätigung",
                Signup_button: "Registrieren",
               already_registered: "Schon registriert?&nbsp;<a href='/login/'>Anmelden</a>"
            },
            fr: {
                hello: "Bonjour,",
                welcome_message: "Nous sommes heureux de vous voir",
                username_placeholder: "Nom d'utilisateur",
                email_placeholder: "Email",
                password_placeholder: "Mot de passe",
                passwordconfirmation_placeholder: "Confirmez votre mot de passe",
                Signup_button: "S'inscrire",
               already_registered: "Deja inscrit?&nbsp;<a href='/login/'>Se connecter</a>"
            }
        };
        this.currentLanguage = localStorage.getItem('selectedLanguage') || "en";
    }

    async unmount() {
        const form = this.getRef('form')
        form.removeEventListener('submit', this.handleSubmitListener)
    }

    async componentDidMount() {
        const form = this.getRef('form')
        form.addEventListener('submit', this.handleSubmitListener)
        this.translatePage()
        this.setupLanguageButtons()
    }

    translatePage() {
        console.log("Page in: ", this.currentLanguage)
        const elements = document.querySelectorAll("[data-translate-key]");
        elements.forEach(el => {
            const key = el.dataset.translateKey;
            if (this.translations[this.currentLanguage][key])
                el.innerHTML = this.translations[this.currentLanguage][key];
        });

        document.getElementById("username").placeholder = this.translations[this.currentLanguage].username_placeholder
        document.getElementById("password").placeholder = this.translations[this.currentLanguage].password_placeholder
        document.getElementById("email").placeholder = this.translations[this.currentLanguage].email_placeholder
        document.getElementById("passwordConfirmation").placeholder = this.translations[this.currentLanguage].passwordconfirmation_placeholder
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
        console.log('Signup error:', error);
        const fields = document.querySelectorAll('.input');
        fields.forEach(field => {
            const el = field.querySelector('label');
            el.classList.remove('hidden');
        });
    }
}
