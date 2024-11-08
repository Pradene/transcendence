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
            { lang: 'en', label: 'English' },
            { lang: 'fr', label: 'Français' },
            { lang: 'de', label: 'Deutsch' }
        ];

        const nav = document.createElement("nav");

        const homeLink = document.createElement("a");
        homeLink.href = '/';
        homeLink.dataset.link = "";
        homeLink.textContent = "pong.";

        const navLinks = document.createElement("div");

        links.forEach(link => {
            const element = document.createElement("a");
            element.href = link.href;
            element.style = "margin-left: 8px;";
            element.dataset.link = "";

            const img = document.createElement("img");
            img.src = link.img;
            img.width = 16;
            img.height = 16;

            element.appendChild(img);
            navLinks.appendChild(element);
        });

        const langMenuContainer = document.createElement("div");
        langMenuContainer.classList.add("lang-menu-container");

        const langIcon = document.createElement("img");
        langIcon.src = "/assets/lang-selec.svg";
        langIcon.style = "cursor: pointer; width: 30px; height: 30px;";
        langIcon.style.width = "24px";
        langIcon.style.height = "24px";
        langIcon.classList.add("nav-item", "nav-link", "language-icon")

        const langMenu = document.createElement("div");
        langMenu.classList.add("lang-dropdown");
        langMenu.style.display = "none";
        langIcons.forEach(icon => {
            const langOption = document.createElement("div");
            langOption.textContent = icon.label;
            langOption.style = "padding: 8px; cursor: pointer;";

            langOption.addEventListener("click", () => {
                localStorage.setItem('selectedLanguage', icon.lang);
                location.reload();
            });

            langMenu.appendChild(langOption);
        });

        langIcon.addEventListener("click", () => {
            langMenu.style.display = langMenu.style.display === "none" ? "block" : "none";
        });

        langMenuContainer.appendChild(langIcon);
        langMenuContainer.appendChild(langMenu);

        nav.appendChild(homeLink);
        nav.appendChild(langMenuContainer);
        nav.appendChild(navLinks);
        this.appendChild(nav);
    }
}

customElements.define("nav-component", Nav);
