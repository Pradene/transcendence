import { Router } from '../utils/Router.js'
import { TemplateComponent } from '../utils/TemplateComponent.js'
import { apiRequest, getURL } from '../utils/utils.js'
import { connectChatSocket } from '../websockets/Chat.js'
import { connectFriendsSocket } from '../websockets/Friends.js'
import { LangSelector } from '../components/LangSelector.js';

export class OTP extends TemplateComponent {
	constructor() {
		super()

		this.translations = {
			en: {
				step: "One more step,",
				info: "We sent you a One Time Password to the email you provided to sign up.",
				login: "Login",
				not_received: "Didn't receive code?",
				resend: "Resend"
			},
			de: {
				step: "Noch ein Schritt,",
				info: "Wir haben Ihnen ein OTP-Code an Ihne Email geshickt.",
				login: "Anmelden",
				not_received: "Passwort nicht erhalten",
				resend: "Senden Sie erneut"
			},
			fr: {
				step: "Encore une etape,",
				info: "Nous vous avons envoye un code OTP a votre adresse mail.",
				login: "Se connecter",
				not_received: "Code non recu ?",
				resend: "Renvoyer"
			}
		}
        this.currentLanguage = localStorage.getItem('selectedLanguage') || "en";


		this.handleSubmitListener = async (e) => await this.handleSubmit(e)
		this.displayCodeListener = (e) => this.displayCode(e)
		this.animCodeListener = () => this.animCode()
		this.sendOTPListener = async () => await this.sendOTP()
        this.langSelector = new LangSelector()
	}

	async unmount() {
		const form = this.getRef('form')
		form.removeEventListener('submit', this.handleSubmitListener)

		const input = this.getRef('input')
		input.removeEventListener('input', this.displayCodeListener)
		input.removeEventListener('focus', this.animCodeListener)
		input.removeEventListener('blur', this.animCodeListener)
	}

	async componentDidMount() {
		const form = this.getRef('form')
		form.addEventListener('submit', this.handleSubmitListener)

		const input = this.getRef('input')
		input.addEventListener('input', this.displayCodeListener)
		input.addEventListener('focus', this.animCodeListener)
		input.addEventListener('blur', this.animCodeListener)

		const otpButton = document.getElementById('otp-button')
		otpButton.addEventListener('click', this.sendOTPListener)
		const langSelectorElement = this.langSelector.render();
        const container = document.querySelector('.container');
        container.insertAdjacentElement('beforebegin', langSelectorElement);
        this.translatePage();
	}

	translatePage() {
        const elements = document.querySelectorAll("[data-translate-key]");
        elements.forEach(el => {
            const key = el.dataset.translateKey;
            el.innerHTML = this.translations[this.currentLanguage][key];
        });
	}

	async sendOTP() {
		try {
			console.log('otp')
			const url = getURL('api/auth/otp/')
			const data = await apiRequest(url)

		} catch (e) {
			console.log(e)
		}
	}

	async handleSubmit(e) {
		e.preventDefault()

		try {
			const input = this.getRef('input')

			if (input.value.length != 6)
				throw new Error('Incomplete code')

			const url = getURL('api/auth/otp/verify/')
			const data = await apiRequest(url, {
				method: 'POST',
				body: {
					code: input.value
				}
			})

			connectChatSocket()
			connectFriendsSocket()

			const router = Router.get()
			await router.navigate('/')

		} catch (e) {
			this.removeCode()
			console.log(e)
		}
	}

	displayCode(event) {
		const label = this.getRef('label')
		const target = event.target

		if (!isNaN(event.data) && !isNaN(parseFloat(event.data))) {
			label.children[target.value.length - 1].textContent = event.data

			// remove and add selected style
			label.children[target.value.length - 1].classList.toggle('active')
			if (target.value.length !== 6)
				label.children[target.value.length].classList.toggle('active')

		} else if (event.data != null) {
			target.value = target.value.substring(0, target.value.length - 1)

		} else if (event.data == null) {
			label.children[target.value.length].textContent = ''
			label.children[target.value.length].classList.toggle('active')
			if (target.value.length + 1 !== 6) {
				label.children[target.value.length + 1].classList.toggle('active')
			}
		}
	}

	animCode() {
		const label = this.getRef('label')
		const input = this.getRef('input')

		if (input.value.length < 6)
				label.children[input.value.length].classList.toggle('active')
	}

	removeCode() {
		const input = this.getRef('input')
		input.value = ''

		const label = this.getRef('label')
		const children = label.children

		Array.from(children).forEach(child => {
			child.textContent = ''
			child.classList.remove('active')
		})

		label.classList.add('shake')

		setTimeout(function() {
			label.classList.remove('shake')
		}, 300)

		children[0].classList.add('active')

	}
}
