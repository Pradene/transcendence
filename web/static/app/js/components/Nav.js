import { getUserID } from "../utils.js"

class NavComponent extends HTMLElement {
    connectedCallback() {
		const userID = getUserID()

        this.innerHTML = `
            <nav>
	        	<a href='/' data-link>
	        		<h1 class="text-900">pong.</h1>
	        	</a>
	        	<div>
	        		<a href='/chat/' data-link>
	        			<img src="/static/assets/chat.svg" alt="Chat">
	        		</a>
	        		<a href='/user/${userID}' data-link>
	        			<img src="/static/assets/user.svg" alt="Profile">
	        		</a>
	        	</div>
	        </nav>
        `
    }
}

// Register the custom elements
customElements.define('nav-component', NavComponent)