import { Router } from "./Router.js"
import { Home } from './views/Home.js'
import { Chat } from './views/Chat.js'
import { Profile } from './views/Profile.js'
import { Login } from './views/Login.js'


document.addEventListener('DOMContentLoaded', () => {

    const app = document.getElementById('app')
    
    const router = new Router(app, [
        {path: '/', view: new Home()},
        {path: '/chat/', view: new Chat()},
        {path: '/login/', view: new Login()},
        {path: '/profile/', view: new Profile()},
    ])

    window.router = router
    router.init()

    document.body.addEventListener('click', (event) => {
        console.log(event.target)
        if (event.target.matches('[data-link]')) {
            event.preventDefault()
            console.log('target url: ', event.target.href)
            router.navigate(event.target.href)
        }
    })
})