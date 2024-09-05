import { TemplateComponent } from "../utils/TemplateComponent.js"
import { registerTemplates } from "../utils/Templates"
import { apiRequest, getURL } from "../utils/utils"

export class OTP extends TemplateComponent {
	constructor() {
		super()
	}

	async componentDidMount() {
		const form = this.getRef("form")
		form.addEventListener("submit", async (e) => {
			await this.handleSubmit(e)
		})
	}
	
	async handleSubmit(e) {
		e.preventDefault()
		const input = this.getRef("input")

		try {
			const url = getURL("")
			await apiRequest(url, "POST", {
				code: input.value
			})

		} catch (e) {
			console.log(e)
		}
	}
}

registerTemplates("OTP", OTP)