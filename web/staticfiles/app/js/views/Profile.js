import { AbstractView } from "./AbstractView.js"
import { Router } from "../Router.js"
import { apiRequest, getURL, updateCSRFToken } from "../utils.js"
import { WebSocketManager } from "../WebSocketManager.js"

export class Profile extends AbstractView {
    constructor() {
        super()

        this.logoutListener = () => this.logout()
        this.searchUserListener = (event) => this.searchUser(event)
        this.WebSocketMessageListener = (event) => this.WebSocketMessage(event.detail)
    }

    getHtml() {
        return `
        <nav-component></nav-component>
        <div class="grid">
            <div id="profile" class="grid__item center">
                <div class="container__flex">
                    <div id="profile-picture" class="profile-picture profile-picture--large ml__12">
                        <img></img>
                    </div>
                    <div class="ml__12">
                        <h2 id="username" class="text-900"></h2>
                        <div class="container__flex mt__8">
                            <a href="/profile/edit/" id="edit-profile" class="button" data-link>Edit profile</a>
                            <button id="logout-button" class="button ml__8">
                                <img src="/static/assets/power-off.svg" alt="Disconnect Icon">
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div id="stats" class="grid__item">
                <div class="main">
                    <div id="stats__winrate">
                        <div></div>
                        <p>0%</p>
                    </div>
                    <div id="stats__info__games">
                        <p>0</p>
                        <p>games</p>
                    </div>
                    <div id="stats__info__wins">
                        <p>0</p>
                        <p>wins</p>
                    </div>
                    <div id="stats__info__loses">
                    <p>0</> 
                        <p>loses</p>
                    </div>
                </div>
            </div>
            <div id="games" class="grid__item">
                <div class="top">
                    <h4 class="text-600">Game history</h4>
                </div>
                <div class="main">
                    <ul id="games__list" class="list"></ul>
                </div>
            </div>
            <div id="requests" class="grid__item">
                <div class="top">
                    <h4 class="text-600">Friend requests</h4>
                </div>
                <div class="main">
                    <ul id="requests__list" class="list"></ul>
                </div>
            </div>
            <div id="users" class="grid__item">
                <form id="search-user" class="top search-bar">
                    <input type="text" id="search-user-input" placeholder="Add friends..." autocomplete=off></input>
                    <button type="submit" id="search-submit" class="button">Search</button>
                </form>
                <div class="main">
                    <ul id="users__list" class="list"></ul>
                </div>
            </div>
            <div id="friends" class="grid__item">
                <div class="top">
                    <h4 class="text-600">Friends</h4>
                </div>
                <div class="main">
                    <ul id="friends__list" class="list"></ul>
                </div>
            </div>
        </div>
        `
    }

    initView() {
        this.getUser()
        this.getGames()
        this.getFriends()
        this.getFriendRequests()

        this.addEventListeners()
    }


    addEventListeners() {
        const button = document.getElementById("logout-button")
        button.addEventListener("click", this.logoutListener)

        const search = document.getElementById("search-user")
        search.addEventListener("submit", this.searchUserListener)

        window.addEventListener('wsMessage', this.WebSocketMessageListener)
    }
    

    removeEventListeners() {
        const button = document.getElementById("logout-button")
        button.removeEventListener("click", this.logoutListener)

        const search = document.getElementById("search-user")
        search.removeEventListener("submit", this.searchUserListener)
        
        window.removeEventListener('wsMessage', this.WebSocketMessageListener)
    }


    WebSocketMessage(event) {
        const message = event.message

        if (message.action == "friend_request_received") {
            const container = document.getElementById("requests-list")
            this.displayFriendRequest(container, message.sender)
        }
    }


    async getUser() {
        try {
            const url = getURL("api/users/")
            const profile = await apiRequest(url)
            
            const profilePicture = document.querySelector("#profile-picture img")
            profilePicture.src = profile.picture

            const username = document.getElementById("username")
            username.textContent = profile.username
        
        } catch (error) {
            console.log(error)
        }
    }


    // Friends
    async getFriends() {
        try {
            const url = getURL("api/users/friends/")
            const friends = await apiRequest(url)
            console.log("friends:", friends)

            const container = document.getElementById("friends__list")
            friends.forEach(friend => {
                this.displayFriend(container, friend)
            })

        } catch (error) {
            console.log(error)
        }
    }

    displayFriend(container, friend) {
        const el = document.createElement("li")
        el.classList.add("list__item")

        el.innerHTML = `
            <div class="profile-picture">
                <img src="${friend.picture}"></img>
            </div>
            <div class="main ml__12">
                <p>${friend.username}</p>
            </div>
        `

        container.appendChild(el)
    }


    async getGames() {
        try {
            const url = getURL("api/games/")
            const games = await apiRequest(url)
            console.log("games:", games)

            const container = document.getElementById("games__list")
            games.forEach(game => {
                this.displayGame(container, game)
            })

        } catch (error) {
            console.log(error)
        }
    }

    displayGame(container, game) {
        const el = document.createElement("li")
        el.classList.add("list__item")

        el.innerHTML = `
            <div class="container__flex start">
                <div class="profile-picture mr__12">
                    <img src="${game.player.picture}"></img>
                </div>
                <p>${game.player.username}</p>
            </div>
            <div>${game.player_score} VS ${game.opponent_score}</div>
            <div class="container__flex end">
                <p>${game.opponent.username}</p>
                <div class="profile-picture ml__12">
                    <img src="${game.opponent.picture}"></img>
                </div>
            </div>
        `

        container.appendChild(el)
    }


    // Friends Request //

    // Get all the friend requests
    async getFriendRequests() {
        try {
            const url = getURL("api/users/friend-requests/")
            const requests = await apiRequest(url)
            console.log("requests:", requests)

            const container = document.getElementById("requests__list")            
            requests.forEach(request => {
                this.displayFriendRequest(container, request.sender)
            })

        } catch (error) {
            console.log(error)
        }
    }

    displayFriendRequest(container, sender) {
        const el = document.createElement("li")

        // Use the provided renderer callback to generate the inner HTML for each list item
        el.innerHTML = `
            <div class="profile-picture">
                <img src="${sender.picture}"></img>
            </div>
            <p class="ml__12">${sender.username}</p>
            <div class="flex">
                <button class="button decline-button">Decline</button>
                <button class="button accept-button ml__8">Accept</button>
            </div>
        `

        container.appendChild(el)
                
        const acceptButton = el.querySelector(".accept-button")
        acceptButton.addEventListener("click", async () => {
            await this.acceptIncomingFriendRequest(sender.id)
            el.remove()
        })
        
        const declineButton = el.querySelector(".decline-button")
        declineButton.addEventListener("click", async () => {
            await this.declineIncomingFriendRequest(sender.id)
            el.remove()
        })
    }


    async acceptIncomingFriendRequest(id) {
        const ws = WebSocketManager.get()

        await ws.sendMessage('friends', {
            'type': 'friend_request_accepted',
            'sender': id
        })
    }

    async declineIncomingFriendRequest(id) {
        const ws = WebSocketManager.get()

        await ws.sendMessage('friends', {
            'type': 'friend_request_declined',
            'sender': id
        })
    }


    // Searching users
    async searchUser(event) {
        event.preventDefault()

        try {
            const query = document.getElementById("search-user-input").value
            const url = getURL(`api/users/search/?q=${query}`)
            const users = await apiRequest(url)
            console.log("users:", users)

            const container = document.getElementById("users__list")
            users.forEach(user => {
                this.displayUser(container, user)
            })

        } catch (error) {
            console.log(error)
        }
    }

    displayUser(container, user) {
        const el = document.createElement("li")
        el.classList.add("list__item")
        
        el.innerHTML = `
            <div class="profile-picture">
                <img src="${user.picture}"></img>
            </div>
            <p class="main">${user.username}</p>
            <button class="button add__button">Add</button>
        `

        const button = el.querySelector(".add__button")
        button.addEventListener("click", async () => {
            await this.sendFriendRequest(user.id)
        })

        container.appendChild(el)
    }


    // Send a friend request
    async sendFriendRequest(id) {
        const ws = WebSocketManager.get()

        await ws.sendMessage('friends', {
            'type': 'friend_request_sended',
            'receiver': id
        })
    }


    // Logout
    async logout() {
        try {
            const url = getURL(`api/users/logout/`)
            const refresh = localStorage.getItem("refresh")

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
            
            const router = Router.get()
            router.navigate("/login/")

        } catch (error) {
            console.log(error)
        }
    }
}