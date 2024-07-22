import { getURL, apiRequest } from "../utils.js"
import { AbstractView } from "./AbstractView.js"

export class ChatCreate extends AbstractView {
    constructor() {
        super()
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
                <ul id="friends">
                </ul>
            </div>
        `
    }

    addEventListeners() {
        this.getFriends()
        
        const input = document.getElementById('input')
        input.addEventListener('keyup', (event) => {
            this.handleSearch(event)
        })
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

    async getFriends() {
        const url = getURL('api/users/friends/')

        try {
            const data = await apiRequest(url)
            this.displayFriends(data)

        } catch (error) {
            console.log(error)
        }
    }

    displayFriends(friends) {
        const container = document.getElementById('friends')
        container.innerHTML = ''
        
        friends.forEach(friend => {
            const el = document.createElement('li')
            el.classList.add('user')
            el.innerHTML = `
                <p>${friend.username}</p>
                <button>Add</button>
            `

            container.appendChild(el)
        })
    }
}