import { Router } from "./Router.js"
import { Home } from './views/Home.js'
import { Chat } from './views/Chat.js'
import { ChatCreate } from "./views/ChatCreate.js"
import { ChatRoom } from './views/ChatRoom.js'
import { Profile } from './views/Profile.js'
import { Login } from './views/Login.js'
import { Signup } from "./views/Signup.js"
import { WebSocketManager } from "./ChatWebSocket.js"

import './components/Nav.js'


document.addEventListener('DOMContentLoaded', () => {

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
    ])

    router.init()

    document.body.addEventListener('click', (event) => {        
        if (isDataLink(event.target)) {
            event.preventDefault()
            router.navigate(event.target.href)
        }
    })
})

const isDataLink = (elem) => {
    var match = false

    while (elem && elem.nodeName.toLowerCase() != 'body') {
        if (elem.matches('[data-link]')) {
            match = true
            break
        }
        
        elem = elem.parentNode
    }

    return match
}