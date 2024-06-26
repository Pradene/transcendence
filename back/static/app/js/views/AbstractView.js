export class AbstractView {
    constructor() {
    }

    setTitle(title) {
        document.title = title
    }

    async getHtml() {
        return `<p>Default View</p>`
    }

    async addEventListeners() {}

    async render(container) {
        container.innerHTML = await this.getHtml()
        this.addEventListeners()
    }
}