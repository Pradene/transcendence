import { AbstractView } from "./AbstractView.js"

export class Home extends AbstractView {
    constructor() {
        super()
    }

    async getHtml() {
        return `
        <nav-component></nav-component>
        <h1>Hello World</h1>
        <script src="/static/scrips/pong/dist/main.js" type="application/javascript"></script>
        `
    }
}