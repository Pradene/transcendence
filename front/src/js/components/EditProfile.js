import { TemplateComponent } from "../utils/TemplateComponent.js"
import { getURL, apiRequest, getCSRFToken } from "../utils/utils.js"

export class EditProfile extends TemplateComponent {
    constructor() {
        super()
    }

    getProfileID() {
        return location.pathname.split("/")[2]
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
            // email.textContent = user.email

            console.log(user)

        } catch (e) {
            console.log(e)
            return
        }
    }

    async componentDidMount() {
        this.getUserInfo()

        const form = this.getRef("form")
        const picture = this.getRef("picture-preview")
        const input = this.getRef("picture-input")
        const username = this.getRef("username")
        const email = this.getRef("email")
        
        form.addEventListener("submit", async (e) => {
            e.preventDefault()
            await this.handleSubmit()
        })

        input.addEventListener("change", (e) => {
            const file = e.target.files[0]

            if (file) {
                // Create a FileReader to read the image file
                const reader = new FileReader()

                // Define the onload function, which will run when the file is read
                reader.onload = function(e) {
                    // Set the src of the image tag to the file data (base64)
                    picture.src = e.target.result
                    // Show the image element
                    picture.style.display = 'block'
                }

                // Read the image file as a Data URL (base64)
                reader.readAsDataURL(file)
            } else {
                // Hide the image if no file is selected
                picture.style.display = 'none'
                picture.src = ''
            }
        })
    }

    async handleSubmit() {
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
            const csrf = await getCSRFToken()

            const response = await fetch(url, {
                method: "POST",
                body: body,
                headers: {
                    "X-CSRFToken": csrf
                },
            })

            const data = await response.json()
            console.log(data)

        } catch (e) {
            console.log(e)
            return
        }
    }

    
}