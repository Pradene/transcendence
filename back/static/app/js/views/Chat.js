import { AbstractView } from "./AbstractView.js"

export class Chat extends AbstractView {
    constructor() {
        super()
    }

    async getHtml() {
        return `
        <h1>Chat</h1>
        `
    }
}