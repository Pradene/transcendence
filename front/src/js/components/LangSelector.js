export class LangSelector {
    constructor() {
        this.langIcons = [
            { lang: 'en', label: 'English'},
            { lang: 'fr', label: 'Français'},
            { lang: 'de', label: 'Deutsch'}
        ];
    }

    render() {
        const langMenuContainer = document.createElement("div")
        langMenuContainer.classList.add("lang-menu-container")

		langMenuContainer.style.position = "fixed"
        langMenuContainer.style.top = "10px"
        langMenuContainer.style.right = "10px"
        langMenuContainer.style.left = "50%"
        langMenuContainer.style.zIndex = "1000"

        const langIcon = document.createElement("img")
        langIcon.src = "/assets/lang-selec.svg"
        langIcon.classList.add("nav-item", "nav-link", "language-icon")
        langIcon.style.cursor = "pointer"
        langIcon.style.width = "24px"
        langIcon.style.height = "24px"

        const langMenu = document.createElement("div")
        langMenu.classList.add("lang-dropdown")
        langMenu.style.display = "none"

        this.langIcons.forEach(icon => {
            const langOption = document.createElement("div")
            langOption.textContent = icon.label
            langOption.style.padding = "8px"
            langOption.style.cursor = "pointer"

            langOption.addEventListener("click", () => {
                localStorage.setItem('selectedLanguage', icon.lang)
                location.reload()
            })

            langMenu.appendChild(langOption)
        })

        langIcon.addEventListener("click", () => {
            langMenu.style.display = langMenu.style.display === "none" ? "block" : "none"
        })

        langMenuContainer.appendChild(langIcon)
        langMenuContainer.appendChild(langMenu)

        return langMenuContainer
    }
}
