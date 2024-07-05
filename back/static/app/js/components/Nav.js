class NavComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <nav>
	        	<h1>
	        		<a href='/' data-link>Pong</a>
	        	</h1>
	        	<div>
	        		<a href='/chat/' data-link>
	        			<img src="../../assets/chat.svg" alt="Chat">
	        		</a>
	        		<a href='/profile/' data-link>
	        			<img src="../../assets/user.svg" alt="Profile">
	        		</a>
	        	</div>
	        </nav>
        `
    }
}

// Register the custom elements
customElements.define('nav-component', NavComponent)