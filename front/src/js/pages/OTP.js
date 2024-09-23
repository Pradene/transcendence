import { Router } from "../utils/Router.js"
import { TemplateComponent } from "../utils/TemplateComponent.js"
import { apiRequest, getURL } from "../utils/utils.js"
import { WebSocketManager } from "../utils/WebSocketManager.js"

export class OTP extends TemplateComponent {
	constructor() {
		super()

		this.handleSubmitListener = async (e) => await this.handleSubmit(e)
	}

	unmount() {
		const form = this.getRef("form")
		form.removeEventListener("submit", this.handleSubmitListener)
	}

	async componentDidMount() {
		const label = this.getRef("label")
		const input = this.getRef("input")
		input.addEventListener("input", (e) => {
			this.displayCode(e)
		})

		input.addEventListener("focus", () => {
			if (input.value.length < 6)
				label.children[input.value.length].classList.add("active")
		})
		
		input.addEventListener("blur", () => {
			if (input.value.length < 6)
				label.children[input.value.length].classList.remove("active")
		})

		const form = this.getRef("form")
		form.addEventListener("submit", this.handleSubmitListener)
	}
	
	async handleSubmit(e) {
		e.preventDefault()

		try {
			const input = this.getRef("input")

			if (input.value.length != 6)
				throw new Error("Incomplete code")
			
			const url = getURL("api/users/verify-otp/")
			const data = await apiRequest(url, "POST", {
				code: input.value
			})

			const router = Router.get()
			router.navigate("/")
		
		} catch (e) {
			console.log(e)
		}
	}

	displayCode(event) {
		const label = this.getRef("label")
		const target = event.target

		if (!isNaN(event.data) && !isNaN(parseFloat(event.data))) {
			label.children[target.value.length - 1].textContent = event.data
			
			// remove and add selected style
			label.children[target.value.length - 1].classList.toggle("active")
			if (target.value.length !== 6)
				label.children[target.value.length].classList.toggle("active")

		} else if (event.data != null) {
			target.value = target.value.substring(0, target.value.length - 1)
		
		} else if (event.data == null) {
			label.children[target.value.length].textContent = ""
			label.children[target.value.length].classList.toggle("active")
			if (target.value.length + 1 !== 6) {
				label.children[target.value.length + 1].classList.toggle("active")
			}
		}
	}
}
