import logging

from config import settings

from background_task import background
from django.core.mail import send_mail


def send_login_email(email, username, code):
	subject = "Your One-Time Password (OTP)"
	message = f"Dear {username},\n\nYour OTP code is {code}. It is valid for the next 10 minutes.\n\nThank you!"
	from_email = settings.DEFAULT_FROM_EMAIL
	to_email = [email]
	send_mail(
		subject,
		message,
		from_email,
		to_email,
		fail_silently=True
	)


def send_signup_email(email, username):
	subject = 'Account creation confirmation'
	message = f"Dear {username},\n\nYour accounthas been created.\n\nThank you!\n\nIf you're not the one that create this account please contact us at pong.point42@gmail.com"
	from_email = settings.DEFAULT_FROM_EMAIL
	recipient_list = [email]
	ret = send_mail(
		subject,
		message,
		from_email,
		recipient_list,
		fail_silently=True
	)
