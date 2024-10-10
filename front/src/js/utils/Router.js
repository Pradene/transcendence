import { checkLogin } from "./utils.js"

export class Router {
    constructor(routes = []) {
        if (Router.instance)
            return Router.instance

        Router.instance = this
        
        this.currentView = null
        this.routes = routes

        this.init()
    }

    init() {
        window.addEventListener('popstate', () => this.handleRoute())
        
        if (!window.location.pathname.endsWith("/")) {
            location += "/"
            history.pushState(null, null, location)
        }

        this.handleRoute()
    }

    async navigate(path) {
        if (!path) {
            return
        }

        if (!path.endsWith("/")) {
            path += "/"
        }

        history.pushState(null, null, path)
        await this.handleRoute()
    }

    async handleRoute() {
        const location = window.location.pathname
        const matchedRoute = this.matchRoute(location)
        if (matchedRoute) {
            const View = matchedRoute.route.view
            const isProtected = matchedRoute.route.protected
            
            if (this.currentView && typeof this.currentView.unmount === "function") {
                this.currentView.unmount()
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
            console.log(location, " doesn't match any route")
            this.navigate('/')
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