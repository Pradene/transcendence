import { AbstractView } from "./AbstractView.js"
import { Router } from "../Router.js"
import { apiRequest, getURL, updateCSRFToken, displayList } from "../utils.js"
import { WebSocketManager } from "../WebSocketManager.js"

export class Profile extends AbstractView {
    constructor() {
        super()

        this.profile = null
        this.games = null

        this.searchUserListener = (event) => this.searchUser(event)
        this.WebSocketMessageListener = (event) => this.WebSocketMessage(event.detail)
    }

    getHtml() {
        return `
        <nav-component></nav-component>
        <div id="profile">
            <div id="profile__info"></div>
            <div id="profile__dashboard">
                <div>
                    <div id="profile__dashboard__winrate">
                        <div id="profile__dashboard__winrate__indicator"></div>
                        <p>0%</p>
                    </div>
                    <div id="profile__dashboard__info__games">
                        <p>0</p>
                        <p>games</p>
                    </div>
                    <div id="profile__dashboard__info__wins">
                        <p>0</p>
                        <p>wins</p>
                    </div>
                    <div id="profile__dashboard__info__loses">
                    <p>0</> 
                        <p>loses</p>
                    </div>
                </div>
            </div>
            <div id="profile__games">
                <h4 class="text-600">Game history</h4>
                <div class="list-container">
                    <div class="hidden">
                        <p>No games yet, what are you waiting...</p>
                    </div>
                    <ul id="games-list" class="list"></ul>
                </div>
            </div>
            <div id="profile__requests">
                <h4 class="text-600">Friend requests</h4>
                <div class="list-container">
                    <div id="profile__requests__message" class="hidden">
                        <p>No one wants to be your friend...</p>
                    </div>
                    <ul id="requests-list" class="list"></ul>
                </div>
            </div>
            <div id="users">
                <form id="search-user" class="search-bar">
                    <input type="text" id="search-user-input" placeholder="Add friends..." autocomplete=off></input>
                    <button type="submit" id="search-submit" class="button">Search</button>
                </form>
                <div class="list-container">
                    <div class="hidden">
                        <p>User not found</p>
                    </div>
                    <ul id="users-list" class="list"></ul>
                </div>
            </div>
            <div id="friends">
                <h4 class="text-600">Friends</h4>
                <div class="list-container">
                    <div>
                        <p>No friends, do you feel alone?</p>
                    </div>
                    <ul id="friends-list" class="list"></ul>
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
        const search = document.getElementById("search-user")
        search.addEventListener("submit", this.searchUserListener)

        window.addEventListener('wsMessage', this.WebSocketMessageListener)
    }
    

    removeEventListeners() {
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

            this.profile = profile

            const container = document.getElementById("profile__info")
            container.innerHTML = `
                <div class="conatiner__flex--centered">
                    <div class="container__flex">
                        <div class="profile-picture profile-picture--large" style="margin-right: 32px">
                            <img src="${profile.picture}"></img>
                        </div>
                        <div>
                            <h2 class="text-900">${profile.username}</h2>
                            <div class="container__flex" style="margin-top: 8px">
                                <a href="/profile/edit/" id="edit-profile" class="button" data-link>Edit profile</a>
                                <button id="logout-button" class="button" style="margin-left: 6px">
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
        try {
            const url = getURL("api/users/friends/")
            const friends = await apiRequest(url)
            console.log("friends:", friends)
            
            const el = document.querySelector("#friends > div > div")
            if (friends.length === 0) {
                el.classList.remove("hidden")
                return
            }

            el.classList.add("hidden")

            const options = {
                containerId: "friends-list",
                renderer: (user) => `
                    <div class="profile-picture" style="margin: 0px 12px">
                        <img src="${user.picture}"></img>
                    </div>
                    <div class="info">
                        <p>${user.username}</p>
                    </div>
                `,
            }

            displayList(friends, options)

        } catch (error) {
            console.log(error)
        }
    }


    async getGames() {
        try {
            const url = getURL("api/games/")
            const games = await apiRequest(url)

            this.games = games

            console.log("games:", games)

            const el = document.querySelector("#profile__games > div > div")
            if (games.length === 0) {
                el.classList.remove("hidden")
                return
            }

            el.classList.add("hidden")

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

            displayList(games, options)

        } catch (error) {
            console.log(error)
        }
    }


    // Friends Request //

    // Get all the friend requests
    async getFriendRequests() {
        try {
            const url = getURL("api/users/friend-requests/")
            const requests = await apiRequest(url)
            
            console.log("requests:", requests)

            const container = document.getElementById("requests-list")
            container.innerHTML = ''
            
            requests.forEach(request => {
                this.displayFriendRequest(container, request.sender)
            })

        } catch (error) {
            console.log(error)
        }
    }

    displayFriendRequest(container, sender) {
        console.log(sender)

        const el = document.createElement("li")

        // Use the provided renderer callback to generate the inner HTML for each list item
        el.innerHTML = `
            <div class="profile-picture">
                <img src="${sender.picture}"></img>
            </div>
            <p class="info">${sender.username}</p>
            <div class="flex">
                <button class="button decline-button">Decline</button>
                <button class="button accept-button">Accept</button>
            </div>
        `

        container.appendChild(el)
                
        const acceptButton = el.querySelector(".accept-button")
        acceptButton.addEventListener("click", async () => {
            await this.acceptIncomingFriendRequest(sender.id)
            el.remove()
            checkAndDisplayEmptyMessage()
        })
        
        const declineButton = el.querySelector(".decline-button")
        declineButton.addEventListener("click", async () => {
            await this.declineIncomingFriendRequest(sender.id)
            el.remove()
            checkAndDisplayEmptyMessage()
        })
        

        const checkAndDisplayEmptyMessage = () => {
            const emptyMessage = document.getElementById("profile__requests__message")
            if (container.children.length === 0) {
                emptyMessage.classList.remove("hidden")
                
            } else {
                emptyMessage.classList.add("hidden")
            }
        }
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
            if (users.length === 0) {
                return 
            }

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