import { checkLogin } from "./utils.js"

export class Router {
    constructor(container, routes = []) {
        if (Router.instance)
            return Router.instance

        this.routes = routes
        this.container = container
        
        Router.instance = this
    }

    init() {
        window.addEventListener('popstate', () => this.handleRoute())
        
        if (!window.location.pathname.endsWith("/")) {
            location += "/"
            history.pushState(null, null, location)
        }

        this.handleRoute()
    }

    navigate(path) {
        if (!path.endsWith("/"))
            path += "/"

        history.pushState(null, null, path)
        this.handleRoute()
    }

    async handleRoute() {
        const isAuthenticated = await checkLogin()

        const location = window.location.pathname
        const matchedRoute = this.matchRoute(location)
        if (matchedRoute) {
            const view = matchedRoute.route.view

            // return login if the user isn't logged in
            if (view.isProtected() && !isAuthenticated) {
                this.navigate('/login/')

            // render the view
            } else {
                this.container.innerHTML = ''
                view.render(this.container)
            }
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