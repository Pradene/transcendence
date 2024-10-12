import { WebSocketManager } from './utils/WebSocketManager.js'
import { Router } from './utils/Router.js'
import { fetchCSRFToken } from './utils/utils.js'

import { Home } from './pages/Home.js'
import { Login } from './pages/Login.js'
import { OTP } from './pages/OTP.js'
import { Signup } from './pages/Signup.js'
import { Chat } from './pages/Chat.js'
import { ChatRoom } from './pages/ChatRoom.js'
import { Search } from './pages/Search.js'
import { Profile } from './pages/Profile.js'
import { EditProfile } from './pages/EditProfile.js'
import { Game } from './pages/Game.js'

import '../js/components/Nav.js'
import '../js/components/LogoutButton.js'
import '../js/components/FriendButton.js'

import '../css/style.scss'
import { MatchMaking } from './pages/MatchMaking.js'
import { Session } from './utils/Session.js'

document.addEventListener('DOMContentLoaded', async () => {

    await fetchCSRFToken()

    new WebSocketManager()
        
    const router = new Router([
        {path: '/', view: new Home(), protected: true},
        {path: '/chat/', view: new Chat(), protected: true},
        {path: '/chat/:id/', view: new ChatRoom(), protected: true},
        {path: '/users/', view: new Search(), protected: true},
        {path: '/users/:id/', view: new Profile(), protected: true},
        {path: '/users/:id/edit/', view: new EditProfile(), protected: true},
        {path: '/login/', view: new Login(), protected: false},
        {path: '/signup/', view: new Signup(), protected: false},
        {path: '/verify-otp/', view: new OTP(), protected: false},
        {path: '/matchmaking/', view: new MatchMaking, protected: true},
        {path: '/game/:id/', view: new Game(), protected: true},
    ])

    document.body.addEventListener('click', async (event) => {
        const target = event.target
        if (isDataLink(target)) {
            event.preventDefault()
            await router.navigate(target.href)
        }
    })
})

const isDataLink = (elem) => {
    let match = false

    while (elem && elem.nodeName.toLowerCase() != 'body') {
        if (elem.matches('[data-link]')) {
            match = true
            break
        }
        
        elem = elem.parentNode
    }

    return match
}