document.addEventListener("DOMContentLoaded", handleLogin)
document.addEventListener("update", handleLogin)

function handleLogin() {
    form = document.getElementById("login-form")

    form.addEventListener("submit", async function(e) {
        
        e.preventDefault()
		const csrf_token = document.querySelector('[name=csrfmiddlewaretoken]').value;
        
        const info = {
            "username": document.getElementById("id_username").value,
            "password": document.getElementById("id_password").value,
        }

        const response = await fetch("/account/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrf_token,
            },
            body: JSON.stringify(info)
        })

		const data = await response.json()

		if (data.success) {
            console.log('success')
            window.location.href = "/"

		} else {
			console.log('error:', data)
		}
    })
}