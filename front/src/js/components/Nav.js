/* import { Session } from "../utils/Session.js"

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
                href: '/users/',
                img: '/assets/search.svg'
            },
            {
                href: '/chat/',
                img: '/assets/chat.svg'
            },
            {
                href: `/users/${Session.getUserID()}/`,
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

customElements.define("nav-component", Nav) */

import { Session } from "../utils/Session.js"

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
                href: '/users/',
                img: '/assets/search.svg'
            },
            {
                href: '/chat/',
                img: '/assets/chat.svg'
            },
            {
                href: `/users/${Session.getUserID()}/`,
                img: '/assets/user.svg'
            }
        ]

        const langIcons = [
            { lang: 'en', emoji: '🇺🇸', alt: 'English' },
            { lang: 'fr', emoji: '🇫🇷', alt: 'Français' },
            { lang: 'de', emoji: '🇩🇪', alt: 'Deutsch' }
        ];

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

        const langLinks = document.createElement("div")
        langLinks.classList.add("lang-links")

        langIcons.forEach(icon => {
            const langIcon = document.createElement("i")
            langIcon.className = icon.flagClass
            langIcon.title = icon.alt
            langIcon.style = "margin-left: 12px; cursor: pointer; font-size: 24px;"

            langIcon.addEventListener("click", () => {
                localStorage.setItem('selectedLanguage', icon.lang)
                location.reload()
            })

            langLinks.appendChild(langIcon)
        })

        nav.appendChild(homeLink)
        nav.appendChild(navLinks)
        nav.appendChild(langLinks)
        this.appendChild(nav)
    }
}

customElements.define("nav-component", Nav)
