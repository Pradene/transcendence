document.addEventListener('DOMContentLoaded', function() {
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
    
    function fetchContent(url) {
        fetch(url, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (!response.ok)
                throw new Error('Network response was not ok')
            return response.text()
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html')
            const content = doc.querySelector('div[data-title]')
            if (content) {
                document.getElementById('app').innerHTML = content.innerHTML
                document.title = content.getAttribute('data-title')
                document.body.focus()
            }

            // Only push a new state if the URL has changed
            if (url !== window.location.href)
                window.history.pushState({url: url}, '', url)
            
            bind()
        })
        .catch(error => console.error('Error fetching content:', error))
    }
    
    window.onpopstate = function(event) {
        if (event.state)
            fetchContent(event.state.url)
    }
    
    bind()
})