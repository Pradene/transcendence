import requests
import logging

from account.models import CustomUser

def login42user(token):
	try:
		headers = {
			"Authorization": f"Bearer {token}"
		}

		response = requests.get("https://api.intra.42.fr/v2/me", headers=headers)
		data = response.json()

		id = data.get("id")
		login = data.get("login")
		email = data.get("email")

		if CustomUser.objects.filter(api_42_id=id).exists():
			user = CustomUser.objects.get(api_42_id=id)
		else:
			user = CustomUser.objects.create_user(
				username=login,
				password=None,
				email=email,
				api_42_id=id
			)

		return user
	except Exception as e:
		logging.info(f'error: {e}')