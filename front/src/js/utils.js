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

export async function getCSRFToken() {
    const url = getURL("api/csrf-token/")
    
    try {
        const response = await fetch(url)
    
        if (response.ok) {
            const data = await response.json()
            const token = data.token

            return token
        
        } else {
            throw new Error(`Failed to fetch data: ${response.status}`)
        }
        
    } catch (e) {
        throw e
    }
}


// Requests to server utils

export async function apiRequest(url, method = "GET", body = null) {
    
    try {
        let headers = new Headers()

        headers.append("Content-type", "application/json")
        
        // const access = localStorage.getItem("access")
        // if (access) headers.append("Authorization", `Bearer ${access}`)
        
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
                const refreshed = await refreshToken()
                if (refreshed)
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
    
    try {
        const data = await apiRequest(
            url,
            "POST"
        )

        return true

    } catch (e) {
        const router = Router.get()
        router.navigate("/login/")
        
        return false
    }
}


export async function checkLogin() {    
    try {
        const url = getURL("api/users/check-login/")
        const data = await apiRequest(
            url,
            "POST"
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
