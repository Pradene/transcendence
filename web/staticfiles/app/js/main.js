import { Router } from "./Router.js"
import { Home } from './views/Home.js'
import { Chat } from './views/Chat.js'
import { ChatCreate } from "./views/ChatCreate.js"
import { ChatRoom } from './views/ChatRoom.js'
import { Profile } from './views/Profile.js'
import { Login } from './views/Login.js'
import { Signup } from "./views/Signup.js"
import { WebSocketManager } from "./ChatWebSocket.js"
import { EditProfile } from "./views/EditProfile.js"

import { initCSRFToken } from "./utils.js"

import './components/Nav.js'


document.addEventListener('DOMContentLoaded', () => {

    initCSRFToken()

    const app = document.getElementById('app')

    const wsManager = new WebSocketManager()
    window.wsManager = wsManager
    
    const router = new Router(app, [
        {path: '/', view: new Home()},
        {path: '/chat/', view: new Chat()},
        {path: '/chat/create-room/', view: new ChatCreate()},
        {path: '/chat/:id/', view: new ChatRoom()},
        {path: '/login/', view: new Login()},
        {path: '/signup/', view: new Signup()},
        {path: '/profile/', view: new Profile()},
        {path: '/profile/edit/', view: new EditProfile()},
    ])

    router.init()

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