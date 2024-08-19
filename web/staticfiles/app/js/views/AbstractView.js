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

    initView() {}

    addEventListeners() {}

    removeEventListeners() {}

    render(container) {
        container.innerHTML = this.getHtml()
        this.initView()
    }
}