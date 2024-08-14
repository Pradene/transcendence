import { AbstractView } from "./AbstractView.js"
import { Router } from "../Router.js"
import { apiRequest, getURL, updateCSRFToken, displayList } from "../utils.js"
import { WebSocketManager } from "../ChatWebSocket.js"

export class Profile extends AbstractView {
    constructor() {
        super()
    }

    getHtml() {
        return `
        <nav-component></nav-component>
        <div class="grid">
            <div id="profile" class="profile"></div>
            <div id="games">
                <h4 class="text-600">Game history</h4>
                <ul id="games-list" class="list"></ul>
            </div>
            <div id="requests">
                <h4 class="text-600">Friend requests</h4>
                <ul id="requests-list" class="list"></ul>
            </div>
            <div id="users">
                <form id="search-form">
                    <input type="text" id="search-input" class="search-bar" placeholder="Add friends..." autocomplete=off></input>
                    <button type="submit" id="search-submit" class="search-bar__button">Search</button>
                </form>
                <ul id="users-list" class="list"></ul>
            </div>
            <div id="friends">
                <h4 class="text-600">Friends</h4>
                <ul id="friends-list" class="list"></ul>
            </div>
        </div>
        `
    }

    addEventListeners() {
        this.getUser()
        this.getGames()
        this.getFriends()
        this.getFriendRequests()

        const search = document.getElementById("search-form")
        search.addEventListener("submit", (event) => {
            event.preventDefault()
            this.searchUser()
        })
    }


    async getUser() {
        try {
            const url = getURL("api/users/")
            const profile = await apiRequest(url)

            const container = document.getElementById("profile")
            container.innerHTML = `
                <div class="flex-centered">
                    <div class="flex">
                        <div class="profile-picture profile-picture--large" style="margin-right: 32px;">
                            <img src="${profile.picture}"></img>
                        </div>
                        <div>
                            <h2 class="text-900">${profile.username}</h2>
                            <div class="flex" style="margin-top: 8px;">
                                <a href="/profile/edit/" id="edit-profile" class="button" data-link>Edit profile</a>
                                <button id="logout-button" class="button" style="margin-left: 6px;">
                                    <img src="/static/assets/power-off.svg" alt="Disconnect Icon">
                                    Disconnect
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `
            
            const button = document.getElementById("logout-button")
            button.addEventListener("click", () => this.logout())
        
        } catch (error) {
            console.log(error)
        }
    }


    // Friends
    async getFriends() {
        const url = getURL("api/users/friends/")

        try {
            const data = await apiRequest(url)
            console.log("friends:", data)

            const options = {
                containerId: "friends-list",
                renderer: (user) => `
                    <div class="profile-picture">
                        <img src="${user.picture}"></img>
                    </div>
                    <div class="info">
                        <p>${user.username}</p>
                    </div>
                `,
            }

            displayList(data, options)

        } catch (error) {
            console.log(error)
        }
    }


    async getGames() {
        const url = getURL("api/games/")

        try {
            const data = await apiRequest(url)
            console.log("games:", data)

            const options = {
                containerId: "games-list",
                renderer: (game) => `
                    <div class="game_player">
                        <div class="profile-picture">
                            <img src="${game.player.picture}"></img>
                        </div>
                        <p class="info">${game.player.username}</p>
                    </div>
                    <div class="game_score">${game.player_score} VS ${game.opponent_score}</div>
                    <div class="game_opponent">
                        <p class="info">${game.opponent.username}</p>
                        <div class="profile-picture">
                            <img src="${game.opponent.picture}" class="pp"></img>
                        </div>
                    </div>
                `,
            }

            displayList(data, options)

        } catch (error) {
            console.log(error)
        }
    }


    // Friends Request //

    // Get all the friend requests
    // maybe need to make it inside of consumer
    async getFriendRequests() {
        try {
            const url = getURL("api/users/friend-requests/")
            const requests = await apiRequest(url)
            console.log("requests:", requests)

            const options = {
                containerId: "requests-list",
                renderer: (request) => `
                    <div class="profile-picture">
                        <img src="${request.sender.picture}"></img>
                    </div>
                    <p class="info">${request.sender.username}</p>
                    <button class="request-button">Accept</button>
                `,
                actions: [
                    {
                        selector: ".request-button",
                        handler: async (request) => {
                            console.log("request:", request)
                            await this.acceptIncomingFriendRequest(request.sender.id)
                        }
                    },
                ]
            }

            displayList(requests, options)

        } catch (error) {
            console.log(error)
        }
    }


    async acceptIncomingFriendRequest(id) {
        const ws = WebSocketManager.get()
        console.log()

        await ws.sendMessage('friends', {
            'type': 'friend_request_accepted',
            'sender': id
        })
    }


    // Searching users
    async searchUser() {
        try {
            const query = document.getElementById("search-input").value
            const url = getURL(`api/users/search/?q=${query}`)
        
            const users = await apiRequest(url)
            console.log("users:", users)

            const options = {
                containerId: "users-list",
                renderer: (user) => `
                    <div class="profile-picture">
                        <img src="${user.picture}"></img>
                    </div>
                    <p class="info">${user.username}</p>
                    <button class="button add-button">Add</button>
                `,
                actions: [
                    {
                        selector: ".add-button",
                        handler: async (user) => {
                            await this.sendFriendRequest(user.id)
                        }
                    },
                ]
            }

            displayList(users, options)

        } catch (error) {
            console.log(error)
        }
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
}