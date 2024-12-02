import { TemplateComponent } from '../utils/TemplateComponent.js'
import {getURL, apiRequest, updateLanguage, setLanguage} from '../utils/utils.js'
import { Router } from '../utils/Router.js'
import { connectChatSocket } from '../websockets/Chat.js'
import { connectFriendsSocket } from '../websockets/Friends.js'
import { LangSelector } from '../components/LangSelector.js'
//import {getURL, apiRequest, setLanguage} from "../utils/utils.js"

export class Login extends TemplateComponent {
    constructor() {
        super()
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

        this.submit42LoginRequestListener = async (e) => await this.submit42LoginRequest(e)
        this.submitLoginRequestListener = async (e) => await this.submitLoginRequest(e)
        this.langSelector = new LangSelector()
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
        const langSelectorElement = this.langSelector.render();
        const container = document.querySelector('.container');
        container.insertAdjacentElement('beforebegin', langSelectorElement);

        await updateLanguage();
        this.currentLanguage = localStorage.getItem('selectedLanguage') || "en";
        this.translatePage();
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
        event.preventDefault();

        const username = this.getRef('username');
        const password = this.getRef('password');
        const rememberMe = document.getElementById('remember-me');

        if (!username || !password || !rememberMe) {
            console.error("Une référence à un champ du formulaire est manquante.");
            return;
        }

        const url = getURL('api/auth/login/');

        try {
            console.log("logging in...")
            const data = await apiRequest(url, {
                method: 'POST',
                body: {
                    username: username.value,
                    password: password.value,
                    remember_me: rememberMe.checked
                }
            });

            console.log("redirecting...")
            const router = Router.get();
            if (data['2fa_enabled']) {
                await router.navigate("/verify-otp/");
            } else {
                connectChatSocket();
                connectFriendsSocket();
                await router.navigate("/");
            }
            setLanguage();

        } catch (e) {
            console.log("logging error: ", e)
            username.value = '';
            password.value = '';
            this.displayErrors(e.message);
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
