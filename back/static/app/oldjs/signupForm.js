document.addEventListener("DOMContentLoaded", handleLogin)
document.addEventListener("update", handleLogin)
	
function handleLogin() {
	form = document.getElementById("signup-form")

	form.addEventListener("submit", async function(e) {
		
		e.preventDefault()
		
		const csrf_token = document.querySelector('[name=csrfmiddlewaretoken]').value;
		
		const info = {
			"username": document.getElementById("id_username").value,
            "password1": document.getElementById("id_password1").value,
            "password2": document.getElementById("id_password2").value,
		}
		
		const response = await fetch("/account/signup/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": csrf_token,
			},
			body: JSON.stringify(info)
		})
		
		const data = await response.json()

		if (data.success) {
			window.location.href = "/account/login/"
		} else {
			console.log('error: ', data)
		}
	})
}