import { TemplateComponent } from "../utils/TemplateComponent.js"

export class EditProfile extends TemplateComponent {
    constructor() {
        super()
    }

    async componentDidMount() {
        const image = this.getRef("picturePreview")
        const input = this.getRef("pictureInput")

        input.addEventListener("change", (e) => {
            const file = e.target.files[0]

            if (file) {
                // Create a FileReader to read the image file
                const reader = new FileReader()

                // Define the onload function, which will run when the file is read
                reader.onload = function(e) {
                    // Set the src of the image tag to the file data (base64)
                    image.src = e.target.result
                    // Show the image element
                    image.style.display = 'block'
                }

                // Read the image file as a Data URL (base64)
                reader.readAsDataURL(file)
            } else {
                // Hide the image if no file is selected
                image.style.display = 'none'
                image.src = ''
            }
        })
    }

    
}