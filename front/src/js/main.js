import { WebSocketManager } from "./utils/WebSocketManager.js"
import { Router } from "./utils/Router.js"

import { Home } from "./components/Home.js"
import { Login } from "./components/Login.js"
import { Signup } from "./components/Signup.js"
import { Chat } from "./components/Chat.js"
import { Search } from "./components/Search.js"
import { Profile } from "./components/Profile.js"
import { OTP } from "./components/OTP.js"

import { NavComponent } from "./components/NavComponent.js"


document.addEventListener('DOMContentLoaded', () => {

    new WebSocketManager()
    
    const router = new Router([
        // {path: '/chat/:id/', view: ChatRoom, protected: True},
        {path: '/', view: Home, protected: true},
        {path: '/chat/', view: Chat, protected: true},
        {path: '/users/', view: Search, protected: true},
        {path: '/users/:id/', view: Profile, protected: true},
        {path: '/login/', view: Login, protected: false},
        {path: '/signup/', view: Signup, protected: false},
        {path: '/verify-otp/', view: OTP, protected: false},
    ])

    document.body.addEventListener('click', (event) => {        
        const link = isDataLink(event.target)
        if (link) {
            event.preventDefault()
            router.navigate(link)
        }
    })
})

const isDataLink = (elem) => {
    let match = null

    while (elem && elem.nodeName.toLowerCase() != 'body') {
        if (elem.matches('[data-link]')) {
            match = elem.href
            break
        }
        
        elem = elem.parentNode
    }

    return match
}