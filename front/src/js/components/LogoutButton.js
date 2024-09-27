import { Router } from "../utils/Router.js"
import { getURL, apiRequest } from "../utils/utils.js"
import { WebSocketManager } from "../utils/WebSocketManager.js"

class LogoutButton extends HTMLElement {
    constructor() {
        super()

        this._button = null
    }

    connectedCallback() {
        this._button = document.createElement("button")
        this._button.className = "btn btn-primary"
        this._button.textContent = "Disconnect"

        this._button.addEventListener("click", async () => {
            await this.handleClick()
        })

        this.appendChild(this._button)
    }

    async handleClick() {
        try {
            const url = getURL("api/auth/logout/")

            await apiRequest(
                url,
                "POST"
            )
            
            const ws = WebSocketManager.get()
            ws.disconnect('chat')
            ws.disconnect('friends')
            
            const router = Router.get()
            router.navigate("/login/")

        } catch (error) {
            console.log(error)
        }
    }
}

customElements.define("logout-button", LogoutButton)
