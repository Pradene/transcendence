export class AbstractView {
    constructor() {
    }

    setTitle(title) {
        document.title = title
    }

    getHtml() {
        return `
        <p>Default View</p>
        `
    }

    async addEventListeners() {}

    async render(container) {
        container.innerHTML = this.getHtml()
        await this.addEventListeners()
    }
}