import { TemplateComponent } from "../utils/TemplateComponent.js"
import { registerTemplates } from "../utils/Templates.js"

export class RoomComponent extends TemplateComponent {
    constructor() {
        super()
    }

    async render(room) {
        await this.parseTemplate()
        await this.componentDidMount(room)

        return this.container
    }

    async componentDidMount(room) {
        const link = this.getRef("link")
        const name = this.getRef("name")
        const picture = this.getRef("picture")
        const message = this.getRef("message")
    }
}

registerTemplates("RoomComponent", RoomComponent)