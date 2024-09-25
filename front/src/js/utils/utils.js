import { WebSocketManager } from "./WebSocketManager.js"
import jwt from "jsonwebtoken"

export function getURL(url) {
    return "https://" + location.hostname + ":" + location.port + "/" + url
}

export function getConnectedUserID() {
    try {
        const token = getCookie("access_token")
        const decoded = jwt.decode(token)

        return decoded.user
    
    } catch (e) {
        return null
    }
}

// CSRF Tokens utils
export async function getCSRFToken() {
    try {
        const url = getURL("api/csrf-token/")
        const response = await fetch(url)
    
        if (response.ok) {
            const data = await response.json()
            const token = data.token

            return token

        } else {
            throw new Error(`Failed to fetch data: ${response.status}`)
        }

    } catch (e) {
        console.log(e)
    }
}


// Requests to server utils
export async function apiRequest(url, method = "GET", body = null) {
    
    try {
        let headers = new Headers()

        headers.append("Content-type", "application/json")
        
        if (method != "GET") {
            const csrfToken = await getCSRFToken()
            if (csrfToken) headers.append("X-CSRFToken", csrfToken)
        }

        const options = {
            method: method.toUpperCase(),
            headers: headers,
            credentials: "include"
        }

        if (body) {
            options.body = JSON.stringify(body)
        }

        const response = await fetch(url, options)
        const data = await response.json()

        if (response.ok) {
            return data

        } else {
            if (response.status == 401) {
                console.log("error: need to refresh token")
                const refreshed = await refreshToken()
                if (refreshed)
                    return await apiRequest(url, method, body)
                else
                    throw new Error("Couldn't refresh access token")

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
    
    try {
        const data = await apiRequest(
            url,
            "POST"
        )

        return true

    } catch (e) {
        return false
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2)
        return parts.pop().split(';').shift()
    
    return null
}

function connectToWebsockets() {
    const ws = WebSocketManager.get()

    const friendsURL = "wss://" + location.hostname + ":" + location.port + "/ws/friends/";
    const chatURL = "wss://" + location.hostname + ":" + location.port + "/ws/chat/";
    
    ws.connect(friendsURL, "friends")
    ws.connect(chatURL, "chat")
}

export async function checkLogin() {
    try {
        const access = getCookie("access_token")
        if (!access) {
            const value = await refreshToken()
            if (value)
                connectToWebsockets()

            return value
        }

        const decoded = jwt.decode(access)     
        const current = Date.now() / 1000

        if (decoded.exp > current) {
            connectToWebsockets()
            return true

        } else {
            const value = await refreshToken()
            return value
        }

    } catch (error) {
        return false
    }
}


export function truncateString(string, maxLength) {
    if (string.length > maxLength)
        return string.substring(0, maxLength) + "..."

    return string
}
