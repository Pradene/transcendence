import { AbstractView } from "./AbstractView.js"

export class Home extends AbstractView {
    constructor() {
        super()
    }

    async getHtml() {
        const head = document.querySelector('head')
        const script = document.createElement('script')
        script.src = 'static/scripts/pong/dist/main.js'
        head.appendChild(script)

        return `
        <nav-component></nav-component>
        <h1>Hello World</h1>
        <script src="/static/scrips/pong/dist/main.js" type="application/javascript"></script>
        `
    }
}