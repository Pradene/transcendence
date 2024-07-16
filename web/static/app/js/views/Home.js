import { AbstractView } from "./AbstractView.js"

let isGameloaded = false

export class Home extends AbstractView {
    constructor() {
        super()
    }

    getHtml() {
        if (!isGameloaded) {
            const head = document.getElementsByTagName('head')[0]
            const script = document.createElement('script')
            script.src = '/static/scripts/pong/dist/main.js'
            head.appendChild(script)
            isGameloaded = true
        }

        return `
        <nav-component></nav-component>
        <h1>Hello World</h1>
        `
    }
}