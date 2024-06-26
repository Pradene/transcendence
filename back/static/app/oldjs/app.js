document.addEventListener('DOMContentLoaded', () => {   
    
    window.addEventListener('popstate', (event) => {
        if (event.state)
            fetchContent(event.state.url)
    })
    
    bind()
})


function handleClick(event) {
    event.preventDefault()
    fetchContent(this.href)
}

function bind() {
    document.querySelectorAll('.link').forEach(link => {
        link.removeEventListener('click', handleClick)
        link.addEventListener('click', handleClick)
    })
}


async function fetchContent(url) {
    const response = await fetch(url, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })

    const data = await response.text()
    
    if (data) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(data, 'text/html')
        
        // Remove all old script from old page
        const oldScripts = document.body.querySelectorAll('script')

        oldScripts.forEach(script => {
            script.parentNode.removeChild(script)
        })

        // Add new script from the current page
        const newScripts = doc.body.querySelectorAll('script')
        
        newScripts.forEach(script => {
            const ns = document.createElement('script')
            ns.src = script.src
            document.body.appendChild(ns)
        })

        // Adding the html to the document
        const content = doc.querySelector('div[data-title]')
        if (content) {
            document.getElementById('app').innerHTML = content.innerHTML
            document.title = content.getAttribute('data-title')
            document.body.focus()
        }
        
        if (url !== window.location.href)
            window.history.pushState({url: url}, '', url)
        
        bind()

        const event = new Event("update")
        document.dispatchEvent(event)

    } else {
        console.log('error')
    }        
}