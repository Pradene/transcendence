import { getURL, getRequest } from "../utils.js"
import { AbstractView } from "./AbstractView.js"

export class ChatCreate extends AbstractView {
    constructor() {
        super()

        this.users = []
    }

    getHtml() {
        return `
            <nav-component></nav-component>
            <div class="flex">
                <label>
                    <input type="text" id="input" placeholder="Search" autocomplete="off"></input>
                </label>
            </div>
            <div>
                <ul id="users-list">
                </ul>
            </div>
        `
    }

    addEventListeners() {   
        this.getUsers()
        
        const input = document.getElementById('input')
        input.addEventListener('keyup', this.handleSearch.bind(this))
    }

    async getUsers() {
        const url = getURL('api/user/friends/')

        try {
            const data = await getRequest(url)
            
            this.users = data.users
            this.displayUsers()

        } catch (error) {
            console.log(error)
        }
    }
    
    handleSearch(event) {
        const query = event.target.value
        
        const users = document.querySelectorAll('.user')
        for (let user of users) {
            const name = user.querySelector('p').textContent
            
            if (query && !name.includes(query)) {
                user.classList.add('hidden')
            
            } else {
                user.classList.remove('hidden')
            }
        }
    }

    displayUsers() {
        const container = document.getElementById('users-list')
        container.innerHTML = ''
        
        this.users.forEach((user) => {
            console.log(user)
            const el = document.createElement('li')
            el.classList.add('user')
            el.innerHTML = `
                <p>
                ${user.name}
                </p>
            `

            container.appendChild(el)
        })
    }
}