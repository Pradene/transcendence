export class BaseComponent {
    constructor(container, props = {}) {
        this.container = container
        this.props = props
        this.state = {}
        this.eventListeners = []
        this.element = null

        this.init()
    }

    // Making request to server to get necessary info
    // then construct the component
    // and apply event listeners
    init() {
        try {
            this.fetchData(() => {
                this.element = this.create()
                
                if (this instanceof Page)
                    this.container.replaceChildren(this.element)
                else if (this instanceof Component)
                    this.container.appendChild(this.element)
                
                this.componentDidMount()
            })

        } catch (error) {
            console.log(error)
        }
    }

    fetchData(callback) {
        callback()
    }

    create() {
        throw new Error("create() must be implemented by subclass")
    }

    componentDidMount() {}

    setState(newState) {
        this.state = { ...this.state, ...newState }
        this.update()
    }

    update() {
        this.unmount()
        
        const newElement = this.init()
        if (this.element && newElement) {
            this.element.replaceWith(newElement)
        }
        
        this.element = newElement
        this.componentDidUpdate()
    }

    componentDidUpdate() {}

    unmount() {
        if (this.element) {
            // this.element.remove()
            this.element = null
        }
        this.componentWillUnmount()
    }

    componentWillUnmount() {
        this.removeEventListeners()
    }

    removeEventListeners() {
        this.eventListeners.forEach(listener => {
            listener.element.removeEventListener(listener.type, listener.eventHandler)
        })
        
        // Clear the store after removing all event listeners
        this.eventListeners = []
    }

    addEventListeners(element, type, handler) {
        if (!(element instanceof HTMLElement) && (element !== window)) {
            console.error("Invalid element passed to addEventListeners")
            return
        }

        if (typeof type !== "string") {
            console.error("Invalid event type passed to addEventListeners")
            return
        }

        if (typeof handler !== "function") {
            console.error("Invalid handler function passed to addEventListeners")
            return
        }

        // Create the event handler function
        const eventHandler = (event) => {
            handler(event)
        }
    
        // Attach the event listener to the element
        element.addEventListener(type, eventHandler)
    
        // Store the event listener details in the store
        this.eventListeners.push({
            element: element,
            type: type,
            handler: handler,
            eventHandler: eventHandler
        })
    }
}

export class Page extends BaseComponent {
    constructor(container, props = {}) {
        super(container, props)
    }

    setTitle(title) {
        document.title = title
    }

    static isProtected() {
        return true
    }
}

export class Component extends BaseComponent {
    constructor(container, props = {}) {
        super(container, props)
    }
}