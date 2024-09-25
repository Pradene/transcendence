import { Router } from '../utils/Router.js'
import { TemplateComponent } from '../utils/TemplateComponent.js'
import { apiRequest, getURL } from '../utils/utils.js'
import { WebSocketManager } from '../utils/WebSocketManager.js'

export class OTP extends TemplateComponent {
	constructor() {
		super()

		this.handleSubmitListener = async (e) => await this.handleSubmit(e)
		this.displayCodeListener = (e) => this.displayCode(e)
		this.animCodeListener = () => this.animCode()
	}

	unmount() {
		const form = this.getRef('form')
		form.removeEventListener('submit', this.handleSubmitListener)

		const input = this.getRef('input')
		input.removeEventListener('input', this.displayCodeListener)
		input.removeEventListener('focus', this.animCodeListener)
		input.removeEventListener('blur', this.animCodeListener)
	}

	async componentDidMount() {
		const input = this.getRef('input')
		input.addEventListener('input', this.displayCodeListener)
		input.addEventListener('focus', this.animCodeListener)
		input.addEventListener('blur', this.animCodeListener)

		const form = this.getRef('form')
		form.addEventListener('submit', this.handleSubmitListener)
	}
	
	async handleSubmit(e) {
		e.preventDefault()

		try {
			const input = this.getRef('input')

			if (input.value.length != 6)
				throw new Error('Incomplete code')
			
			const url = getURL('api/users/verify-otp/')
			const data = await apiRequest(url, 'POST', {
				code: input.value
			})

			console.log('navigate')

			const router = Router.get()
			router.navigate('/')
		
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
		})

		children[0].classList.toggle('active')
	}
}
