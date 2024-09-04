import { isHtmlTag } from "./HtmlTags.js"
import { TemplatesRegistry, TemplatesDirectory } from "./Templates.js"

export class TemplateComponent {
    // Not initialize this class, use derived class
    constructor() {
        this.container = null
        this.refs = {}
    }

    getTemplateURL() {
        return TemplatesDirectory + this.constructor.name + ".html"
    }

    async loadTemplate() {
        try {
            const response = await fetch(this.getTemplateURL())
            const text = await response.text()

            return text
    
        } catch (error) {
            console.error('Error loading template:', error)
            return null
        }
    }

    removeWhitespaceNodes(node) {
        // Recursively remove all whitespace-only text nodes
        for (let i = node.childNodes.length - 1; i >= 0; i--) {
            const child = node.childNodes[i]

            if (child.nodeType === Node.TEXT_NODE && child.textContent.trim() === "") {
                node.removeChild(child)
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                this.removeWhitespaceNodes(child)
            }
        }

        return node
    }

    async parseTemplate() {
        if (this.container !== null) return this.container

        const template = await this.loadTemplate()
        if (!template) return null
        
        const parser = new DOMParser()
        const doc = parser.parseFromString(template, "application/xml")

        const node = this.removeWhitespaceNodes(doc.documentElement)

        const container = document.createDocumentFragment()
        await this.parseNode(container, node)
        this.container = container
    }

    async parseNode(container, node) {
        if (node.nodeType === Node.TEXT_NODE) {
            // If the node is a text node, append the text content
            const text = node.textContent.trim()
            if (text)
                container.appendChild(document.createTextNode(text))

        } else if (isHtmlTag(node.tagName)) {
            // If the node is a HTMLElement, create it
            const element = document.createElement(node.tagName)
            Array.from(node.attributes).forEach(attr => element.setAttribute(attr.name, attr.value))

            // Append the element to refs if it has a ref attribute
            if (element.hasAttribute("ref")) {
                const refName = element.getAttribute("ref")
                this.refs[refName] = element

                element.removeAttribute("ref")
            }

            // Process child nodes recursively
            Array.from(node.childNodes).forEach(childNode => {
                this.parseNode(element, childNode)
            })

            container.appendChild(element)
        } else {
            // Custom component: Instantiate and render
            const ComponentClass = TemplatesRegistry[node.tagName]
            if (ComponentClass) {
                const placeholder = document.createElement("div")
                container.appendChild(placeholder)

                const componentInstance = new ComponentClass()
                const component = await componentInstance.render()

                placeholder.replaceWith(component)

            } else {
                console.warn(`Unknown component: ${node.tagName}`)
            }
        }
    }

    getRef(refName) {
        if (this.refs[refName])
            return this.refs[refName]

        console.warn(`Ref ${refName} not found`)
        return null
    }

    async render() {
        await this.parseTemplate()

        await this.componentDidMount()
        
        return this.container
    }

    async componentDidMount() {}
}
