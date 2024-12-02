import { TemplateComponent } from "../utils/TemplateComponent.js"
import {getURL, apiRequest, updateLanguage} from "../utils/utils.js"
import { Router } from '../utils/Router.js'

export class EditProfile extends TemplateComponent {
    constructor() {
        super()

        this.translations = {
            en: {
                pic_btn: "Change picture",
                username: "Username",
                email: "Email",
                e2FA: "Enable 2FA",
                edit_btn: "Edit profile",
                language: "Default language"
            },
            de: {
                pic_btn: "Bild ändern",
                username: "Benutzername",
                email: "Email",
                e2FA: "Aktivieren 2FA",
                edit_btn: "Profil bearbeiten",
                language: "Standardsprache"
            },
            fr: {
                pic_btn: "Modifier l'image de profil",
                username: "Nom d'utilisateur",
                email: "Email",
                e2FA: "Activer le 2FA",
                edit_btn: "Modifier le profil",
                language: "Langue par defaut"
            }
        }

        this.handleSubmitListener = async (e) => await this.handleSubmit(e)
        this.handlePictureChangeListener = (e) => this.handlePictureChange(e)
    }

    async unmount() {
        const form = document.getElementById("form")
        const input = document.getElementById("file-upload")
        form.removeEventListener("submit", this.handleSubmitListener)
        input.removeEventListener("change", this.handlePictureChangeListener)
    }

    async componentDidMount() {
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
        this.getUserInfo()

        const form = document.getElementById("form")
        const input = document.getElementById("file-upload")
        form.addEventListener("submit", this.handleSubmitListener)
        input.addEventListener("change", this.handlePictureChangeListener)
        this.translatePage()
    }

    translatePage() {
        const elements = document.querySelectorAll("[data-translate-key]");
        elements.forEach(el => {
            const key = el.dataset.translateKey;
            if (this.translations[this.currentLanguage][key])
                el.innerHTML = this.translations[this.currentLanguage][key];
        });

        const usernameInput = document.getElementById("username");
        if (usernameInput) {
            usernameInput.placeholder = this.translations[this.currentLanguage].username;
        }

        const emailInput = document.getElementById("email");
        if (emailInput) {
            emailInput.placeholder = this.translations[this.currentLanguage].email;
        }
    }

    async getUserInfo() {
        try {
            const id = this.getProfileID()
            const url = getURL(`api/users/${id}/`)

            const user = await apiRequest(url)

            const picture = document.getElementById("picture-preview")
            const username = document.getElementById("username")
            const email = document.getElementById("email")
            const is_2fa_enabled = document.getElementById("is_2fa_enabled")

            picture.src = user.picture
            username.value = user.username
            email.value = user.email
            is_2fa_enabled.checked = user.is_2fa_enabled
        } catch (e) {
            console.log(e)
            return
        }
    }

    handlePictureChange(e) {
        const picture = document.getElementById("picture-preview")
        const file = e.target.files[0]

        if (file) {
            const reader = new FileReader()
            reader.onload = function(e) {
                picture.src = e.target.result
            }
            reader.readAsDataURL(file)

        } else {
            picture.src = ''
        }
    }

    async handleSubmit(e) {
        e.preventDefault()

        const input = document.getElementById("file-upload")
        const username = document.getElementById("username")
        const email = document.getElementById("email")
        const is_2fa_enable = document.getElementById("is_2fa_enabled")

        try {
            const body = new FormData()

            body.append("username", username.value)
            body.append("email", email.value)
            body.append("is_2fa_enabled", is_2fa_enable.checked)
            const languageSelect = document.getElementById("language-select");
            body.append("language", languageSelect.value)

            const file = input.files[0]
            if (file)
                body.append("picture", file)

            const id = this.getProfileID()
            const url = getURL(`api/users/${id}/`)

            const data = await apiRequest(url, {
                method: "POST",
                body: body
            })
            await updateLanguage(languageSelect.value);

            const router = Router.get()
            await router.navigate('/')

        } catch (e) {
            console.log(e)
            return
        }
    }

    getProfileID() {
        return location.pathname.split("/")[2]
    }
}
