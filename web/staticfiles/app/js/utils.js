export function getCSRFToken() {
    const token = localStorage.getItem('csrf-token')

    return token ? token : null
}

export function initCSRFToken() {
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    
    localStorage.setItem('csrf-token', token)
}

export function updateCSRFToken() {
    fetch('/api/csrf-token/')
    .then(response => response.json())
    .then(data => {
        const token = data.token
        
        localStorage.removeItem('csrf-token')
        localStorage.setItem('csrf-token', token)
    })
}

// export function getCSRFToken() {
    // return document.querySelector('meta[name="csrf-token"]').getAttribute('content')
// }

// export function getCSRFToken() {
//     const name = 'csrftoken'
//     let token = null

//     if (document.cookie && document.cookie !== '') {
//         const cookies = document.cookie.split(';')
//         for (let i = 0; i < cookies.length; i++) {
            
//             const cookie = cookies[i].trim()

//             // Does this cookie string begin with the name we want?
//             if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                 token = decodeURIComponent(cookie.substring(name.length + 1))
//                 break
//             }
//         }
//     }

//     return token
// }

async function refreshToken() {
    const csrfToken = getCSRFToken()
    const refresh = localStorage.getItem('refresh')

    if (!refresh)
        throw new Error('not connected')
    
    try {
        let headers = new Headers()

        headers.append('Content-type', 'application/json')
        headers.append('X-CSRFToken', csrfToken)
        if (access)
            headers.append('Authorization', `Bearer ${access}`)

        const response = await fetch('api/user/refresh-token/', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({'refresh': refresh})
        })

        if (response.ok) {
            const data = await response.json()
            localStorage.setItem('access', data.access)

        } else {
            console.log('error: Failed to fetch data')
        }
            
    } catch (error) {
        console.log('error: ', error)
    }
}

export async function postRequest(url, body) {
    const access = localStorage.getItem('access')
    const csrfToken = getCSRFToken()

    console.log(body)
    
    try {
        let headers = new Headers()

        headers.append('Content-type', 'application/json')
        headers.append('X-CSRFToken', csrfToken)
        if (access)
            headers.append('Authorization', `Bearer ${access}`)

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        })

        console.log(response.status)


        if (response.ok) {
            console.log('Success')
            const data = await response.json()

            return data

        } else {
            if (response.status == 401) {
                await refreshToken()
                return postRequest(url, body)

            } else {
                console.log('error: Failed to fetch data')
            }
        }
            
    } catch (error) {
        console.log('error: ', error)
    }
}

export async function getRequest(url) {
    const access = localStorage.getItem('access')
    const csrfToken = getCSRFToken()
    
    try {
        let headers = new Headers()

        headers.append('Content-type', 'application/json')
        headers.append('X-CSRFToken', csrfToken)
        if (access)
            headers.append('Authorization', `Bearer ${access}`)

        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        })

        if (response.ok) {
            const data = await response.json()
            return data

        } else {
            if (response.status == 401) {
                // Need to refresh access token
                
                // await refreshToken()
                // return getRequest(url)
                console.log('not authorized')

            } else {
                console.log('error: Failed to fetch data')
            }
        }
            
    } catch (error) {
        console.log('error: ', error)
    }
}

export function getURL(url) {
    return "https://" + location.hostname + ":" + location.port + "/" + url
}