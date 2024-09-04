import { TemplateComponent } from "../utils/TemplateComponent.js"
import { registerTemplates } from "../utils/Templates.js"

export class UserComponent extends TemplateComponent {
    constructor() {
        super()
    }

    async render(user) {
        await this.parseTemplate()
        await this.componentDidMount(user)

        return this.container
    }

    async componentDidMount(user) {
        const link = this.getRef("link")
        const name = this.getRef("name")
        const picture = this.getRef("picture")

        link.href = `/users/${user.id}/`
        name.textContent = user.username
        picture.src = user.picture
    }
}

registerTemplates("UserComponent", UserComponent)