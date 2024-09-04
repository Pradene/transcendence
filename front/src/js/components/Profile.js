import { TemplateComponent } from "../utils/TemplateComponent.js"
import { registerTemplates } from "../utils/Templates.js"
import { getURL, apiRequest } from "../utils/utils.js"

export class Profile extends TemplateComponent {
    constructor() {
        super()
    }

    async componentDidMount() {
        await this.getUser()
    }

    async getUser() {
        try {
            const id = this.getID()
            const url = getURL(`api/users/${id}/`)
            
            const user = await apiRequest(url)

            const picture = this.getRef("userPicture")
            const username = this.getRef("userName")

            picture.src = user.picture
            username.textContent = user.username

        } catch (error) {
            console.log(error)
        }
    }

    getID() {
        return location.pathname.split("/")[2]
    }
}

registerTemplates("Profile", Profile)