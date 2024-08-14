import { Router } from "./Router.js"

export function getURL(url) {
    return "https://" + location.hostname + ":" + location.port + "/" + url
}

// CSRF Tokens utils

export function getCSRFToken() {
    const token = localStorage.getItem("csrf-token")

    return token ? token : null
}

export function initCSRFToken() {
    const token = document.querySelector("meta[name='csrf-token']").getAttribute("content")
    
    localStorage.setItem("csrf-token", token)
}

export async function updateCSRFToken() {
    const url = getURL("api/csrf-token/")
    
    try {
        const response = await fetch(url)
    
        if (response.ok) {
            const data = await response.json()
            const token = data.token

            localStorage.removeItem("csrf-token")
            localStorage.setItem("csrf-token", token)
        
        } else {
            throw new Error(`Failed to fetch data: ${response.status}`)
        }
        
    } catch (e) {
        throw e
    }
}


// Requests to server utils

export async function apiRequest(url, method = "GET", body = null) {
    const access = localStorage.getItem("access")
    const csrfToken = getCSRFToken()
    
    try {
        let headers = new Headers()

        headers.append("Content-type", "application/json")
        if (csrfToken)  headers.append("X-CSRFToken", csrfToken)
        if (access)     headers.append("Authorization", `Bearer ${access}`)

        const options = {
            method: method.toUpperCase(),
            headers: headers
        }

        if (body) {
            options.body = JSON.stringify(body)
        }

        const response = await fetch(url, options)
        const data = await response.json()

        if (response.ok) {
            return data

        } else {
            console.log(data.error)
            if (response.status == 401) {
                await refreshToken()
                return await apiRequest(url, method, body)

            } else {
                throw new Error(data.error)
            }
        }

    } catch (e) {
        throw e
    }
}

async function refreshToken() {
    const url = getURL("api/users/refresh-token/")

    const refresh = localStorage.getItem("refresh")
    if (!refresh) throw new Error("not connected")
    
    try {
        const data = await apiRequest(
            url,
            "POST",
            {refresh: refresh}
        )

        localStorage.setItem("access", data.access)

    } catch (e) {
        localStorage.removeItem("refresh")
        localStorage.removeItem("access")
        
        Router.get().navigate("/login/")
    }
}


export async function checkLogin() {
    const url = getURL("api/users/check-login/")
    const refresh = localStorage.getItem("refresh")

    try {
        const data = await apiRequest(
            url,
            "POST",
            {refresh: refresh}
        )
        
        return data.authenticated
        
    } catch (e) {
        return false
    }
}


export function displayList(items, options) {
    if (!items || !Array.isArray(items) || items.length === 0) return

    const container = document.getElementById(options.containerId)
    container.innerHTML = ''

    items.forEach(item => {
        const el = document.createElement("li")

        // Use the provided renderer callback to generate the inner HTML for each list item
        el.innerHTML = options.renderer(item)

        // Attach event listeners for each action provided in options
        if (options.actions && Array.isArray(options.actions)) {
            options.actions.forEach(action => {
                const button = el.querySelector(action.selector)
                if (button) {
                    button.addEventListener("click", async () => {
                        await action.handler(item)
                    })
                }
            })
        }

        container.appendChild(el)
    })
}