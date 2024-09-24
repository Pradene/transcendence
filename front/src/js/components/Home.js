import { TemplateComponent } from "../utils/TemplateComponent.js"
import { registerTemplates } from "../utils/Templates.js"

export class Home extends TemplateComponent {
    constructor() {
        super()
    }
}

registerTemplates("Home", Home)

window.addEventListener('load', () => {
    const container = document.querySelector('.container');
    container.style.display = 'none';
    container.offsetHeight;
    container.style.display = 'flex';
});
