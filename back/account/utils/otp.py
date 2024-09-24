import pyotp
import logging

from config import settings
from django.core.mail import send_mail

def generate_otp(user):
    if user.otp_secret is None:
        user.otp_secret = pyotp.random_base32()
        user.save()
    totp = pyotp.TOTP(user.otp_secret, interval=600)
    return totp.now()

def validate_otp(user, otp_input):
	totp = pyotp.TOTP(user.otp_secret, interval=600)
	ret = totp.verify(otp_input)
	logging.info(f'{otp_input} : {user.otp_secret} : {ret}')
	return ret

def send_otp_code(user):
	code = generate_otp(user)
	logging.info(f'code: {code}')
	subject = "Your One-Time Password (OTP)"
	message = f"Dear {user.username},\n\nYour OTP code is {code}. It is valid for the next 10 minutes.\n\nThank you!"
	from_email = settings.DEFAULT_FROM_EMAIL
	recipient_list = [user.email]
	send_mail(subject, message, from_email, recipient_list)