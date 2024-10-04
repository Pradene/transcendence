import { TemplateComponent } from "../utils/TemplateComponent.js"
import { getURL, apiRequest, getCSRFToken } from "../utils/utils.js"

export class EditProfile extends TemplateComponent {
    constructor() {
        super()

        this.handleSubmitListener = async (e) => await this.handleSubmit(e)
        this.handlePictureChangeListener = (e) => this.handlePictureChange(e)
    }

    unmount() {
        const form = this.getRef("form")
        const input = this.getRef("picture-input")
        form.removeEventListener("submit", this.handleSubmitListener)
        input.removeEventListener("change", this.handlePictureChangeListener)
    }

    async componentDidMount() {
        this.getUserInfo()

        const form = this.getRef("form")
        const input = this.getRef("picture-input")
        form.addEventListener("submit", this.handleSubmitListener)
        input.addEventListener("change", this.handlePictureChangeListener)
    }

    async getUserInfo() {
        try {
            const id = this.getProfileID()
            const url = getURL(`api/users/${id}/`)

            const user = await apiRequest(url)

            const picture = this.getRef("picture-preview")
            const username = this.getRef("username")
            const email = this.getRef("email")

            picture.src = user.picture
            username.value = user.username
            email.value = user.email

        } catch (e) {
            console.log(e)
            return
        }
    }

    handlePictureChange(e) {
        const picture = this.getRef("picture-preview")
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

        const input = this.getRef("picture-input")
        const username = this.getRef("username")
        const email = this.getRef("email")

        try {
            const body = new FormData()

            body.append("username", username.value)
            body.append("email", email.value)

            const file = input.files[0]
            if (file)
                body.append("picture", file)
            
            const id = this.getProfileID()
            const url = getURL(`api/users/${id}/`)
            
            const data = await apiRequest(url, {
                method: "POST",
                body: body
            })

        } catch (e) {
            console.log(e)
            return
        }
    }

    getProfileID() {
        return location.pathname.split("/")[2]
    }
}
