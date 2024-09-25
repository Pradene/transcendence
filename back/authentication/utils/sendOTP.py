import pyotp
import logging

from config import settings
from django.core.mail import send_mail

from authentication.models import OTP

def sendOTP(user):
	code = OTP.generate(user)
	logging.info(f'code: {code}')
	
	subject = "Your One-Time Password (OTP)"
	message = f"Dear {user.username},\n\nYour OTP code is {code}. It is valid for the next 10 minutes.\n\nThank you!"
	
	from_email = settings.DEFAULT_FROM_EMAIL
	to_email = [user.email]

	send_mail(subject, message, from_email, to_email)
