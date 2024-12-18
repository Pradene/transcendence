import { checkLogin, getURL } from "./utils.js"

export class Router {
    constructor(routes = []) {
        if (Router.instance)
            return Router.instance

        Router.instance = this
        
        this.currentView = null
        this.routes = routes
        this.history = ["/"]

        this.init()
    }

    init() {
        window.addEventListener('popstate', () => this.handleRoute())
        
        if (!window.location.pathname.endsWith("/")) {
            const location = window.location.pathname + '/'
            history.pushState(null, null, location)
        }

        this.handleRoute()
    }

    async navigate(path, isBackward = false) {
        if (!path || path === window.location.pathname) {
            return
        }

        if (!path.endsWith("/")) {
            path += "/"
        }

        if (!isBackward) {
            this.history.push(location.pathname)
        }
        history.pushState(null, null, path)

        console.log(this.history)
        await this.handleRoute()
    }

    async back() {
        if (this.currentView && typeof this.currentView.unmount === "function") {
            await this.currentView.unmount()
        }

        const url = this.history.length > 0 ? this.history.pop() : "/"
        console.log(this.history)
        this.navigate(url, true)
    }

    async handleRoute() {
        const location = window.location.pathname
        const matchedRoute = this.matchRoute(location)
        if (matchedRoute) {
            const View = matchedRoute.route.view
            const isProtected = matchedRoute.route.protected
            
            if (this.currentView && typeof this.currentView.unmount === "function") {
                await this.currentView.unmount()
            }
            
            const isAuthenticated = await checkLogin()
            if (isProtected && !isAuthenticated) {
                // return to login page if the user isn't logged in
                this.navigate('/login/')
                
            } else {
                // render the view
                this.currentView = View
                View.render()
            }

        } else {
            this.navigate('/404')
        }
    }

    matchRoute(path) {
        const potentialMatches = this.routes.map(route => {
            return {
                route: route,
                isMatch: path.match(this.pathToRegex(route.path))
            }
        })

        let match = potentialMatches.find(match => match.isMatch)

        return match
    }

    pathToRegex(path) {
        return new RegExp('^' + path.replace(/:\w+/g, '([^/]+)') + '$')
    }

    getParams(path, match) {
        const values = match.slice(1)
        const keys = [...path.matchAll(/:(\w+)/g)].map(result => result[1])
        
        return Object.fromEntries(keys.map(
            (key, i) => [key, values[i]]
        ))
    }

    static get() {
        return (Router.instance ? Router.instance : new Router())
    }
}