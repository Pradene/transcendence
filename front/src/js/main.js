import { WebSocketManager } from "./utils/WebSocketManager.js"
import { Router } from "./utils/Router.js"
import { fetchCSRFToken } from "./utils/utils.js"
import { GameSocket } from "./pong/GameSocket.js"

import { Home } from "./pages/Home.js"
import { Login } from "./pages/Login.js"
import { OTP } from "./pages/OTP.js"
import { Signup } from "./pages/Signup.js"
import { Chat } from "./pages/Chat.js"
import { ChatRoom } from "./pages/ChatRoom.js"
import { Search } from "./pages/Search.js"
import { Profile } from "./pages/Profile.js"
import { EditProfile } from "./pages/EditProfile.js"
import { TournamentView } from "./pages/TournamentView";

import { GameView } from "./pages/GameView.js"
import "../js/components/Nav.js"
import "../js/components/LogoutButton.js"

import "../js/components/FriendButton.js"
import "../css/style.scss"

document.addEventListener("DOMContentLoaded", async () => {

    await fetchCSRFToken()

    new WebSocketManager()
    
    const router = new Router([
        {path: '/', view: new Home(), protected: true},
        {path: '/chat/', view: new Chat(), protected: true},
        {path: '/chat/:id/', view: new ChatRoom(), protected: true},
        {path: '/users/', view: new Search(), protected: true},
        {path: '/users/:id/', view: new Profile(), protected: true},
        {path: "/users/:id/edit/", view: new EditProfile(), protected: true},
        {path: '/login/', view: new Login(), protected: false},
        {path: '/signup/', view: new Signup(), protected: false},
        {path: '/verify-otp/', view: new OTP(), protected: false},
        {path: '/game/:id/', view: new GameView(), protected: true},
        {path: '/tournament/:id', view: new TournamentView(), protected: true},
    ])

    document.body.addEventListener("click", (event) => {
        const target = event.target
        if (isDataLink(target)) {
            event.preventDefault()
            router.navigate(target.href)
        }
    })

    window.addEventListener('beforeunload', () => {
        const socket = GameSocket.get()
        if (socket)
            socket.close()
    })
})

const isDataLink = (elem) => {
    let match = false

    while (elem && elem.nodeName.toLowerCase() != "body") {
        if (elem.matches("[data-link]")) {
            match = true
            break
        }
        
        elem = elem.parentNode
    }

    return match
}