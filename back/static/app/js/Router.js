export class Router {
    constructor(container, routes = []) {
        if (Router.instance)
            return Router.instance

        Router.instance = this

        this.userConnectStatus = false;
        this.routes = routes
        this.container = container
    }

    init() {
        window.addEventListener('popstate', () => this.handleRoute())
        this.handleRoute()
    }

    navigate(path) {
        history.pushState(null, null, path)
        this.handleRoute()
    }

    userIsConnected() {
        return this.userConnectStatus
    }

    setUserIsConnected() {
        this.userConnectStatus = true
    }

    handleRoute() {
        let location

        if (!this.userIsConnected()
        && window.location.pathname != '/login/'
        && window.location.pathname != '/signup/') {
            location = '/login/'
        } else {
            location = window.location.pathname
        }

        const matchedRoute = this.matchRoute(location)
        if (matchedRoute) {
            const view = matchedRoute.route.view
            
            // Insert content of the view into the page
            if (view && typeof view.render === 'function') {
                
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
}