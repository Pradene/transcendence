import { WebSocketManager } from "./utils/WebSocketManager.js"
import { Router } from "./utils/Router.js"

import { Home } from "./pages/Home.js"
import { Login } from "./pages/Login.js"
import { OTP } from "./pages/OTP.js"
import { Signup } from "./pages/Signup.js"
import { Chat } from "./pages/Chat.js"
import { ChatRoom } from "./pages/ChatRoom.js"
import { Search } from "./pages/Search.js"
import { Profile } from "./pages/Profile.js"
import { EditProfile } from "./pages/EditProfile.js"

import "../js/components/Nav.js"
import "../js/components/LogoutButton.js"
import "../js/components/FriendButton.js"

import "../css/style.scss"

document.addEventListener("DOMContentLoaded", () => {

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
    ])

    document.body.addEventListener("click", (event) => {        
        const link = isDataLink(event.target)
        if (link) {
            event.preventDefault()
            router.navigate(link)
        }
    })
})

const isDataLink = (elem) => {
    let match = null

    while (elem && elem.nodeName.toLowerCase() != "body") {
        if (elem.matches("[data-link]")) {
            match = elem.href
            break
        }
        
        elem = elem.parentNode
    }

    return match
}