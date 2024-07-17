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

    addEventListeners() {}

    render(container) {
        container.innerHTML = this.getHtml()
        this.addEventListeners()
    }
}