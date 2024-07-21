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

            console.log(localStorage.getItem("csrf-token"))
            const token = data.token
            console.log("csrf updated: ", token)

            localStorage.removeItem("csrf-token")
            localStorage.setItem("csrf-token", token)
        } else {
            console.log("error")
        }

    } catch (error) {

    }
}


// Requests to server utils

async function refreshToken() {
    console.log("Refresh token")

    const url = getURL("api/user/refresh-token/")

    const refresh = localStorage.getItem("refresh")
    const csrfToken = getCSRFToken()

    if (!refresh)
        throw new Error("not connected")
    
    try {
        let headers = new Headers()

        headers.append("Content-type", "application/json")
        headers.append("X-CSRFToken", csrfToken)

        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({refresh: refresh})
        })

        if (response.ok) {
            const data = await response.json()
            localStorage.setItem("access", data.access)

        } else {
            localStorage.removeItem("refresh")
            localStorage.removeItem("access")

            const router = Router.get()
            router.navigate("/login/")
        }
            
    } catch (error) {
        console.log("error: ", error)
    }
}

export async function postRequest(url, body) {
    const access = localStorage.getItem("access")
    const csrfToken = getCSRFToken()
    
    try {
        let headers = new Headers()

        headers.append("Content-type", "application/json")
        headers.append("X-CSRFToken", csrfToken)
        if (access)
            headers.append("Authorization", `Bearer ${access}`)

        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body)
        })

        if (response.ok) {
            console.log("Success")
            const data = await response.json()

            return data

        } else {
            if (response.status == 401) {
                await refreshToken()
                postRequest(url, body)

            } else {
                console.log("error: Failed to fetch data")
            }
        }

    } catch (error) {
        console.log("error: ", error)
    }
}

export async function getRequest(url) {
    const access = localStorage.getItem("access")
    const csrfToken = getCSRFToken()
    
    try {
        let headers = new Headers()

        headers.append("Content-type", "application/json")
        headers.append("X-CSRFToken", csrfToken)
        if (access)
            headers.append("Authorization", `Bearer ${access}`)

        const response = await fetch(url, {
            method: "GET",
            headers: headers
        })

        if (response.ok) {
            const data = await response.json()
            return data

        } else {
            if (response.status == 401) {                
                await refreshToken()
                getRequest(url)

            } else {
                console.log("error: Failed to fetch data")
            }
        }

    } catch (error) {
        console.log("error: ", error)
    }
}

export async function checkLogin() {
    const url = getURL("api/user/check-login/")
    const refresh = localStorage.getItem("refresh")

    const csrfToken = getCSRFToken()

    try {
        let headers = new Headers()
        
        headers.append("Content-type", "application/json")
        headers.append("X-CSRFToken", csrfToken)
        
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({refresh: refresh})
        })
        
        if (response.ok) {
            const data = await response.json()
            console.log(data)
            return true
        
        } else {
            console.log("error from server")
            return false
        }
        
    } catch (error) {
        return false
    }
}