import { Nav } from "../components/Nav.js"
import { Page } from "../utils/Component.js"

let game_loaded = false

export class Home extends Page {
    constructor(container, props = {}) {
        super(container, props)
    }

    initView() {
        const script = document.createElement('script')
        const appcontainer = document.querySelector('div#app')
        
        script.src = '/src/scripts/pong/dist/main.js'
        
        appcontainer.appendChild(script)
    }
}