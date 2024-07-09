// export function getCSRFToken() {
    // return document.querySelector('meta[name="csrf-token"]').getAttribute('content')
// }

export function getCSRFToken() {
    const name = 'csrftoken'
    let token = null

    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';')
        for (let i = 0; i < cookies.length; i++) {
            
            const cookie = cookies[i].trim()

            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                token = decodeURIComponent(cookie.substring(name.length + 1))
                break
            }
        }
    }

    return token
}