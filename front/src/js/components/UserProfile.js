import {Router} from "../utils/Router"

class UserProfile extends HTMLElement {
    constructor() {
        super()
        
        this.userid = 0
    }

    async connectedCallback() {
        const userid = this.getAttribute('userid')
        const response = await fetch(`/api/users/${userid}/`)
        const exists = response.status !== 404
        const data = exists ? await response.json() : {
            username: "?",
            picture: "/assets/unknown.png"
        }

        const playerImgContainer = document.createElement('div')
        const playerImg = document.createElement('img')
        const playerUsername = document.createElement('p')

        playerImgContainer.classList.add('profile-picture')
        playerImg.src = data.picture
        playerUsername.textContent = data.username

        playerImgContainer.appendChild(playerImg)
        this.appendChild(playerImgContainer)
        this.appendChild(playerUsername)

        this.userid = userid
        this.addEventListener("click", async (event) => {
            event.stopPropagation()
            await Router.get().navigate(`/users/${this.userid}/`)
        })
    }
}

customElements.define('user-profile', UserProfile)