import { AbstractView } from "./AbstractView.js"
import { Router } from "../Router.js"
import { getRequest, getURL, postRequest, updateCSRFToken } from "../utils.js"
import { WebSocketManager } from "../ChatWebSocket.js"

export class Profile extends AbstractView {
    constructor() {
        super()

        this.logout = this.logout.bind(this)
        this.searchUser = this.searchUser.bind(this)
    }

    getHtml() {
        return `
        <nav-component></nav-component>
        <h1>Profile</h1>
        <button id="logout">Logout</button>
        <form id="search-form">
            <input type="text" id="search-input" placeholder="Search User" autocomplete=off></input>
            <button type="submit" id="search-submit">Send</button>
        </form>
        <ul id="list">
        </ul>
        <ul id="friend-requests">
        </ul>
        `
    }

    addEventListeners() {
        this.getFriendRequests()

        const button = document.getElementById("logout")
        button.addEventListener("click", this.logout)

        const search = document.getElementById("search-form")
        search.addEventListener("submit", this.searchUser)
    }


    // Friends Request //

    // Get all the friend requests
    // maybe need to make it inside of consumer
    async getFriendRequests() {
        const url = getURL("api/user/friend-requests/")

        try {
            const data = await getRequest(url)
            this.displayIncomingFriendRequests(data)

        } catch (error) {
            console.log(error)
        }
    }

    displayIncomingFriendRequests(requests) {
        if (!requests)
            return

        console.log("friends request", requests)

        const container = document.getElementById("friend-requests")
        requests.forEach(request => {
            const sender = request.sender

            const el = document.createElement("li")
            el.innerHTML = `
                <p>${sender.username}</p>
                <button>Accept</button>
            `

            const button = el.querySelector("button")
            button.addEventListener("click", () => {
                this.acceptIncomingFriendRequest(sender.id)
            })

            container.appendChild(el)
        })
    }

    async acceptIncomingFriendRequest(id) {
        const url = getURL(`api/user/friend-requests/${id}/accept/`)

        try {
            const data = await postRequest(url, {})
            console.log(data)

        } catch (error) {
            console.log(error)
        }
    }


    // Send a friend request
    async sendFriendRequest(id) {
        const url = getURL(`api/user/friend-requests/${id}/`)
        
        try {
            const data = await postRequest(url, {})
            console.log(data)

        } catch (error) {
            console.log(error)
        }
    }


    // Searching users
    async searchUser(event) {
        event.preventDefault()

        const query = document.getElementById("search-input").value
        const url = getURL(`api/user/search-users/?q=${query}`)
        
        try {
            const data = await getRequest(url)
            this.displayUsers(data)

        } catch (error) {
            console.log(error)
        }
    }

    displayUsers(users) {
        if (!users)
            return

        const container = document.getElementById("list")
        container.innerHTML = ""

        users.forEach(user => {
            
            const username = user.username
            const id = user.id
            
            const el = document.createElement("li")
            el.classList.add("list-item")
            el.innerHTML = `
                <p>${username}</p>
                <button>Add</button>
            `

            const button = el.querySelector("button")
            button.addEventListener("click", () => {
                this.sendFriendRequest(id)
            })

            container.appendChild(el)
        })
    }


    // Logout
    async logout() {
        const url = getURL(`api/user/logout/`)
        const refresh = localStorage.getItem("refresh")

        try {
            await postRequest(url, {refresh})

            localStorage.removeItem("access")
            localStorage.removeItem("refresh")
            
            const ws = WebSocketManager.get()
            ws.disconnect()
            
            updateCSRFToken()
            
            const router = Router.get()
            router.navigate("/login/")

        } catch (error) {
            console.log(error)
        }
    }
}