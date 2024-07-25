import { AbstractView } from "./AbstractView.js"
import { Router } from "../Router.js"
import { apiRequest, getURL, updateCSRFToken } from "../utils.js"
import { WebSocketManager } from "../ChatWebSocket.js"

export class Profile extends AbstractView {
    constructor() {
        super()
    }

    getHtml() {
        return `
        <nav-component></nav-component>
        <div class="grid">
            <div class="profile">
                <div>
                    <div class="flex">
                        <img id="pp" class="pp--large"></img>
                        <div>
                            <div class="flex">
                                <p id="username" class="profile__username"></p>
                                <button id="logout" class="logout-button">
                                    <img src="/static/assets/power-off.svg" alt="Logout">
                                </button>
                            </div>
                            <a href="/login/edit/" id="edit" class="button" data-link>Edit profile</a>
                        </div>
                    </div>
                    <p id="bio"></p>
                </div>
            </div>
            <div class="friend-requests">
                <ul id="friend-requests" class="list"></ul>
            </div>
            <div class="games">
                <ul id="games" class="list"></ul>
            </div>
            <div class="search-form">
                <form id="search-form">
                    <input type="text" id="search-input" class="search-bar" placeholder="Username..." autocomplete=off></input>
                    <button type="submit" id="search-submit" class="search-bar__button">Search</button>
                </form>
                <ul id="list" class="list"></ul>
            </div>
            <div class="friends">
                <ul id="friends" class="list" class="list"></ul>
            </div>
        </div>
        `
    }

    addEventListeners() {
        this.getUser()
        this.getGames()
        this.getFriends()
        this.getFriendRequests()

        const button = document.getElementById("logout")
        button.addEventListener("click", () => this.logout())

        const search = document.getElementById("search-form")
        search.addEventListener("submit", (event) => {
            event.preventDefault()
            this.searchUser()
        })
    }

    // Logout
    async logout() {
        const url = getURL(`api/users/logout/`)
        const refresh = localStorage.getItem("refresh")

        try {
            await apiRequest(
                url,
                "POST",
                {refresh: refresh}
            )

            localStorage.removeItem("access")
            localStorage.removeItem("refresh")
            
            const ws = WebSocketManager.get()
            ws.disconnect('chat')
            ws.disconnect('friends')
            
            await updateCSRFToken()
            
            Router.get().navigate("/login/")

        } catch (error) {
            console.log(error)
        }
    }


    async getUser() {
        const url = getURL("api/users/")

        try {
            const data = await apiRequest(url)            
            this.displayProfile(data)

        } catch (error) {
            console.log(error)
        }
    }

    displayProfile(data) {
        const pp = document.getElementById("pp")
        const username = document.getElementById("username")
        const bio = document.getElementById("bio")

        username.textContent = data.username
        bio.textContent = data.bio
        pp.src = data.picture
    }


    // Friends
    async getFriends() {
        const url = getURL("api/users/friends/")

        try {
            const data = await apiRequest(url)
            this.displayFriends(data)

        } catch (error) {
            console.log(error)
        }
    }

    async getGames() {
        const url = getURL("api/games/")

        try {
            const data = await apiRequest(url)
            console.log(data)
            this.displayGames(data)

        } catch (error) {
            console.log(error)
        }
    }

    displayGames(games) {
        const container = document.getElementById("games")
        container.innerHTML = ""
        
        if (!games)
            return

        games.forEach(game => {

            const player = game.player
            const pScore = game.player_score

            const opponent = game.opponent
            const oScore = game.opponent_score
            
            const el = document.createElement("li")
            el.classList.add("list__item")
            el.innerHTML = `
                <div class="flex" style="flex:1">
                    <img src="${player.picture}" class="pp"></img>
                    <p class="info">${player.username}</p>
                </div>
                <div>${pScore} VS ${oScore}</div>
                <div class="flex" style="flex:1">
                    <p class="info" style="text-align:right">${opponent.username}</p>
                    <img src="${opponent.picture}" class="pp"></img>
                </div>
            `

            container.appendChild(el)
        })
    }


    // Friends Request //

    // Get all the friend requests
    // maybe need to make it inside of consumer
    async getFriendRequests() {
        const url = getURL("api/users/friend-requests/")

        try {
            const data = await apiRequest(url)
            this.displayIncomingFriendRequests(data)

        } catch (error) {
            console.log(error)
        }
    }


    async acceptIncomingFriendRequest(id) {
        const ws = WebSocketManager.get()

        await ws.sendMessage('friends', {
            'type': 'friend_request_accepted',
            'sender': id
        })
    }


    // Send a friend request
    async sendFriendRequest(id) {
        const url = getURL(`api/users/friend-requests/${id}/`)
        
        try {
            const data = await apiRequest(url, "POST", {})
            console.log(data)

        } catch (error) {
            console.log(error)
        }
    }


    // Searching users
    async searchUser() {
        const query = document.getElementById("search-input").value
        const url = getURL(`api/users/search/?q=${query}`)
        
        try {
            const data = await apiRequest(url)
            
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
            const picture = user.picture
            
            const el = document.createElement("li")
            el.classList.add("list__item")
            el.innerHTML = `
                <img src="${picture}" class="pp"></img>
                <p class="info">${username}</p>
                <button class="button">Add</button>
            `

            const button = el.querySelector("button")
            button.addEventListener("click", () => {
                this.sendFriendRequest(id)
            })

            container.appendChild(el)
        })
    }

    displayIncomingFriendRequests(requests) {
        if (!requests)
            return

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

    displayFriends(friends) {
        if (!friends)
            return

        console.log("friends", friends)

        const container = document.getElementById('friends')
        friends.forEach(friend => {
            const el = document.createElement('li')
            el.classList.add("list__item")
            el.innerHTML = `
                <img src="${friend.picture}" class="pp"></img>
                <div class="info">
                    <p>${friend.username}</p>
                </div>
            `

            container.appendChild(el)
        })
    }
}