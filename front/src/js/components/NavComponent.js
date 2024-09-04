import { getUserID } from "../utils/utils.js"
import { registerTemplates } from "../utils/Templates.js"
import { TemplateComponent } from "../utils/TemplateComponent.js"

export class NavComponent extends TemplateComponent {
	constructor() {
		super()

		this.id = getUserID()
	}

	async componentDidMount() {
		const profileLink = this.getRef("profileLink")
		profileLink.href = `/users/${this.id}/`
	}
}

registerTemplates("NavComponent", NavComponent)
