import { Router } from "./Router.js"
import { Home } from './views/Home.js'
import { Chat } from './views/Chat.js'
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
        {path: '/chat/:id/', view: new ChatRoom()},
        {path: '/login/', view: new Login()},
        {path: '/signup/', view: new Signup()},
        {path: '/profile/', view: new Profile()},
    ])

    window.router = router
    router.init()

    document.body.addEventListener('click', (event) => {
        if (event.target.matches('[data-link]')) {
            event.preventDefault()
            router.navigate(event.target.href)
        }
    })
})