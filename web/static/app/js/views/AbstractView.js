export class AbstractView {
    constructor() {
    }

    isProtected() {
        return true
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