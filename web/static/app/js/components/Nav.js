class NavComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <nav>
	        	<a href='/' data-link>
	        		<h1>Pong</h1>
	        	</a>
	        	<div>
	        		<a href='/chat/' data-link>
	        			<img src="/static/assets/chat.svg" alt="Chat">
	        		</a>
	        		<a href='/profile/' data-link>
	        			<img src="/static/assets/user.svg" alt="Profile">
	        		</a>
	        	</div>
	        </nav>
        `
    }
}

// Register the custom elements
customElements.define('nav-component', NavComponent)