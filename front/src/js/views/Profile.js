import { Router } from "../utils/Router.js"
import { apiRequest, getURL } from "../utils/utils.js"
import { WebSocketManager } from "../utils/WebSocketManager.js"
import { Page } from "../utils/Component.js"
import { Nav } from "../components/Nav.js"
import { FriendButton } from "../components/ProfileButton.js"
import { createElement } from "../utils/createElement.js"
import { ListComponent } from "../components/List.js"

export class Profile extends Page {
    constructor(container, props = {}) {
        super(container, props)
    }

    fetchData(callback) {
        const userPromise = this.getUser()
        const gamesPromise = this.getGames()
        const friendsPromise = this.getFriends()

        // this.getFriendRequests()

        Promise.all([userPromise, gamesPromise, friendsPromise])
            .then(([user, games, friends]) => {
                this.user = user
                this.games = games
                this.friends = friends

                console.log(user)
                console.log(friends)

                if (typeof callback === "function") {
                    callback()
                }
            })
            .catch(error => {
                console.error("Error in fetchData:", error)
            })
    }

    create() {
        // Main container
        const content = createElement("div")

        // Nav
        const nav = new Nav(content)

        // Grid container
        const grid = document.createElement("div")
        grid.className = "grid"
        content.appendChild(grid)

        // Profile
        const profile = document.createElement("div")
        profile.id = "profile"
        profile.className = "grid-item center"
        grid.appendChild(profile)

        // Profile container
        const profileContainer = document.createElement("div")
        profileContainer.className = "container__flex"
        profile.appendChild(profileContainer)

        // Profile picture
        const profilePictureContainer = document.createElement("div")
        profilePictureContainer.id = "profile-picture"
        profilePictureContainer.className = "profile-picture profile-picture--large ml__12"
        profileContainer.appendChild(profilePictureContainer)

        const profilePicture = document.createElement("img")
        profilePicture.src = this.user.picture
        profilePictureContainer.appendChild(profilePicture)

        // Profile info
        const profileInfoContainer = document.createElement("div")
        profileInfoContainer.className = "ml__12"
        profileContainer.appendChild(profileInfoContainer)

        const profileUsername = document.createElement("h2")
        profileUsername.id = "username"
        profileUsername.className = "text-900"
        profileUsername.textContent = this.user.username
        profileInfoContainer.appendChild(profileUsername)

        // Relation button
        if (this.user.status !== "self") {
            const friendButton = new FriendButton(
                profileInfoContainer,
                {
                    id: this.user.id,
                    status: this.user.status
                }
            )
        } else {
            const logoutButton = createElement("button", {
                attributes: {
                    id: "logout__button"
                },
                classes: ["button"],
                textContent: "Disconnect",
                parent: profileInfoContainer
            })
        }

        // Friends
        const friends = createElement("div", {
            attributes: { id: "friends" },
            classes: ["grid-item"],
            parent: grid
        })

        const titleContainer = createElement("div", {
            classes: ["top"],
            parent: friends
        })

        const title = createElement("h4", {
            classes: ["text-600"],
            textContent: "Friends",
            parent: titleContainer
        })

        const friendsContainer = createElement("div", {
            classes: ["main"],
            parent: friends
        })

        const friendsList = new ListComponent(
            friendsContainer,
            {
                id: "friends__list", 
                items: this.friends,
            },
            (friend) => this.displayFriend(friend)
        )

        // const friendsList = createElement("ul", {
        //     attributes: {
        //         id: "friends__list",
        //     },
        //     classes: ["list"],
        //     parent: friendsContainer
        // })

        // this.friends.forEach(friend => {
        //     this.displayFriend(friendsList, friend)
        // })

//         <div id="friends" class="grid-item">
//             <div class="top">
//                 <h4 class="text-600">Friends</h4>
//             </div>
//             <div class="main">
//                 <ul id="friends__list" class="list"></ul>
//             </div>
//         </div>

return content

        return
        `
        <nav-component></nav-component>
        <div class="grid">
            <div id="profile" class="grid-item center">
                <div class="container__flex">
                    <div id="profile-picture" class="profile-picture profile-picture--large ml__12">
                        <img></img>
                    </div>
                    <div class="ml__12">
                        <h2 id="username" class="text-900"></h2>
                        <div id="profile__buttons" class="container__flex mt__8"></div>
                    </div>
                </div>
            </div>
            <div id="stats" class="grid-item">
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
            <div id="games" class="grid-item">
                <div class="top">
                    <h4 class="text-600">Game history</h4>
                </div>
                <div class="main">
                    <ul id="games__list" class="list"></ul>
                </div>
            </div>
            <div id="requests" class="grid-item">
                <div class="top">
                    <h4 class="text-600">Friend requests</h4>
                </div>
                <div class="main">
                    <ul id="requests__list" class="list"></ul>
                </div>
            </div>
            <div id="friends" class="grid-item">
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

    componentDidMount() {
        if (this.user.status === "self") {
            console.log(this.user)
            const button = this.element.querySelector("#logout__button")
            this.addEventListeners(
                button,
                "click",
                () => this.logout()
            )
            
            this.addEventListeners(
                window,
                "wsMessage",
                (event) => this.WebSocketMessage(event.detail)
            )
        }
    }


    WebSocketMessage(event) {
        console.log("WebSocket event", event)
        // const message = event.message

        // if (message.action == "friend_request_received") {
        //     const container = document.getElementById("requests__list")
        //     this.displayFriendRequest(container, message.sender)
        // }
    }


    getUser() {
        try {
            const id = this.getID()
            const url = getURL(`api/users/${id}/`)
            
            return apiRequest(url)
                .then(response => {
                    return response
                })
                .catch(error => {
                    throw error
                })
        
        } catch (error) {
            console.log(error)
        }
    }


    // Friends
    getFriends() {
        try {
            const id = this.getID()
            const url = getURL(`api/users/${id}/friends/`)
            return apiRequest(url)
                .then(response => {
                    return response
                })
                .catch(error => {
                    throw error
                })

        } catch (error) {
            console.log(error)
        }
    }

    displayFriend(friend) {
        if (!friend) return

        const friendItem = createElement("li", {
            classes: ["list__item"]
        })

        const profilePictureContainer = createElement("div", {
            classes: ["profile-picture"],
            parent: friendItem
        })

        const profilePicture = createElement("img", {
            attributes: { src: friend.picture },
            parent: profilePictureContainer
        })

        const usernameContainer = createElement("div", {
            classes: ["main", "ml__12"],
            parent: friendItem
        })

        const username = createElement("p", {
            textContent: friend.username,
            parent: usernameContainer
        })

        return friendItem
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
        el.classList.add("list__item")

        // Use the provided renderer callback to generate the inner HTML for each list item
        el.innerHTML = `
            <div class="profile-picture">
                <img src="${sender.picture}"></img>
            </div>
            <p class="main ml__12">${sender.username}</p>
            <div class="container__flex">
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


    // Logout
    async logout() {
        try {
            const url = getURL(`api/auth/logout/`)

            await apiRequest(
                url,
                "POST"
            )
            
            const ws = WebSocketManager.get()
            ws.disconnect('chat')
            ws.disconnect('friends')
            
            const router = Router.get()
            router.navigate("/login/")

        } catch (error) {
            console.log(error)
        }
    }

    getID() {
        return location.pathname.split("/")[2]
    }
}
