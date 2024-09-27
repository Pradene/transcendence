export class TemplateComponent {
    // Not initialize this class, use derived class
    constructor() {
        this.container = null
    }

    getTemplateURL() {
        return "/src/js/templates/" + this.constructor.name + ".html"
    }

    getRef(name) {
        const element = document.querySelector(`[ref="${name}"]`)

        return element
    }

    render() {
        fetch(this.getTemplateURL())
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser()
                const doc = parser.parseFromString(html, "text/html")
                
                if (doc.body) {
                    document.body.replaceChildren()
                    // Iterate over each child node and append to the current document's body
                    Array.from(doc.body.childNodes).forEach(child => {
                        document.body.appendChild(child.cloneNode(true))
                    })

                    return document.body

                } else {
                    return Promise.reject("No content found")
                }
            })
            .then(content => {
                this.componentDidMount()
            })
            .catch(error => {console.log("Error:", error)})
    }

    componentDidMount() {}
}
