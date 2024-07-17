import { getCSRFToken } from "../utils.js"
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
        const access = localStorage.getItem('access')

        try {
            const response = await fetch(`/api/user/get-friends/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`
                }
            })
            
            if (response.ok) {
                const data = await response.json()
                this.users = data.users
                this.displayUsers()
            
            } else {
                console.log('Failed to fetch data')
            }

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