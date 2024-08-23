export class AbstractView {
    constructor() {
        this.eventListeners = []
    }

    isProtected() {
        return true
    }

    setTitle(title) {
        document.title = title
    }

    getHtml() {}

    initView() {}

    addEventListeners(element, type, handler, childSelector = null) {
        // Create the event handler function
        const eventHandler = function(event) {
            if (!childSelector || event.target.matches(childSelector)) {
                handler(event)
            }
        }
    
        // Attach the event listener to the element
        element.addEventListener(type, eventHandler)
    
        // Store the event listener details in the store
        this.eventListeners.push({
            element: element,
            type: type,
            handler: handler,
            eventHandler: eventHandler,
            childSelector: childSelector
        })
    }

    removeEventListeners() {
        console.log("remove all event listeners from the previous page")     
        this.eventListeners.forEach(listener => {
            console.log(listener)
            listener.element.removeEventListener(listener.type, listener.eventHandler)
        })
        
        // Clear the store after removing all event listeners
        this.eventListeners.length = 0
    }

    render(container) {
        container.innerHTML = this.getHtml()
        this.initView()
    }
}