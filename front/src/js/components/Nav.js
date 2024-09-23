import { getConnectedUserID } from "../utils/utils.js"

class Nav extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        this.render()
    }

    render() {
        const links = [
            {
                href: '/notifications/',
                img: '/assets/bell.svg'
            },
            {
                href: '/users/',
                img: '/assets/search.svg'
            },
            {
                href: '/chat/',
                img: '/assets/chat.svg'
            },
            {
                href: `/users/${getConnectedUserID()}/`,
                img: '/assets/user.svg'
            }
        ]

        const nav = document.createElement("nav")

        const homeLink = document.createElement("a")
        homeLink.href = '/'
        homeLink.dataset.link = ""
        homeLink.textContent = "pong."
        
        const navLinks = document.createElement("div")
        
        links.forEach(link  => {
            const element = document.createElement("a")
            element.href = link.href
            element.style = "margin-left: 8px;"
            element.dataset.link = ""
            
            const img = document.createElement("img")
            img.src = link.img
            img.width = 16
            img.height = 16

            element.appendChild(img)
            navLinks.appendChild(element)
        })
        
        nav.appendChild(homeLink)
        nav.appendChild(navLinks)
        this.appendChild(nav)
    }
}

customElements.define("nav-component", Nav)