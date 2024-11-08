import { TemplateComponent } from "../utils/TemplateComponent.js"
import { getURL, apiRequest } from "../utils/utils.js"
import { Router } from '../utils/Router.js'

export class EditProfile extends TemplateComponent {
    constructor() {
        super()

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
        this.getUserInfo()

        const form = document.getElementById("form")
        const input = document.getElementById("file-upload")
        form.addEventListener("submit", this.handleSubmitListener)
        input.addEventListener("change", this.handlePictureChangeListener)
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

            const file = input.files[0]
            if (file)
                body.append("picture", file)
            
            const id = this.getProfileID()
            const url = getURL(`api/users/${id}/`)
            
            const data = await apiRequest(url, {
                method: "POST",
                body: body
            })

            const router = Router.get()
            router.back()

        } catch (e) {
            console.log(e)
            return
        }
    }

    getProfileID() {
        return location.pathname.split("/")[2]
    }
}
