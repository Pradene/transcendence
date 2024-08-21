import { Router } from "./Router.js"
// import { jwt_decode } from "jwt-decode"

export function getURL(url) {
    return "https://" + location.hostname + ":" + location.port + "/" + url
}

export function getUserID() {
    // const token = localStorage.getItem("access")

    // if (token) {
    //     console.log(token)
    //     const decodedToken = jwt_decode(token)
    //     console.log("decode", decodedToken)
    //     return decodedToken.user_id
    // }

    return localStorage.getItem("user_id")
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


export function truncateString(string, maxLength) {
    if (string.length > maxLength)
        return string.substring(0, maxLength) + "..."

    return string
}
