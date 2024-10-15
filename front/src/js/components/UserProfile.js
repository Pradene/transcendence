class UserProfile extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const userid = this.getAttribute('playerid')
        const data = await (await fetch(`/api/users/${userid}/`)).json()

        const playerImgContainer = document.createElement('div')
        playerImgContainer.classList.add('profile-picture')
        const playerImg = document.createElement('img')
        playerImg.src = data.picture
        const playerUsername = document.createElement('p')
        playerUsername.textContent = data.username

        playerImgContainer.appendChild(playerImg)
        this.appendChild(playerImgContainer)
        this.appendChild(playerUsername)
    }
}

customElements.define('user-profile', UserProfile)