export function getCSRFToken() {
    const token = localStorage.getItem('csrf-token')
    console.log(token)

    return token ? token : null
}

export function initCSRFToken() {
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    console.log(token)
    
    localStorage.setItem('csrf-token', token)
}

export function updateCSRFToken() {
    fetch('/api/csrf-token/')
    .then(response => response.json())
    .then(data => {
        const token = data.token
        console.log(token)
        
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