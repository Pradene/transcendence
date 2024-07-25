export class AbstractView {
    constructor() {
    }

    isProtected() {
        return true
    }

    setTitle(title) {
        document.title = title
    }

    getHtml() {}

    addEventListeners() {}

    render(container) {
        container.innerHTML = this.getHtml()
        this.addEventListeners()
    }
}