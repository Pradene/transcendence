import { Router } from "../utils/Router.js"
import { TemplateComponent } from "../utils/TemplateComponent.js"
import { registerTemplates } from "../utils/Templates"
import { apiRequest, getURL } from "../utils/utils"

export class OTP extends TemplateComponent {
	constructor() {
		super()
	}

	async componentDidMount() {
		const input = this.getRef("input")
		input.addEventListener("input", (e) => {
			console.log("heloo")
			this.displayCode(e)
		})

		const form = this.getRef("form")
		form.addEventListener("submit", async (e) => {
			await this.handleSubmit(e)
		})
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

		} else if (event.data != null) {
			target.value = target.value.substring(0, target.value.length - 1)
		
		} else if (event.data == null) {
			label.children[target.value.length].textContent = ""
		}
	}
}

registerTemplates("OTP", OTP)