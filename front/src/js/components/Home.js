import { TemplateComponent } from "../utils/TemplateComponent.js"
import { registerTemplates } from "../utils/Templates.js"

export class Home extends TemplateComponent {
    constructor() {
        super()
    }
}

registerTemplates("Home", Home)
