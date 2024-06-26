import { AbstractView } from "./AbstractView.js"

export class Home extends AbstractView {
    constructor() {
        super()
    }

    async getHtml() {
        return `
        <h1>Hello World</h1>
        `
    }
}