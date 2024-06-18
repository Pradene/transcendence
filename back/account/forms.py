from django import forms 
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class SignupForm(UserCreationForm):
    class Meta:
        model = User
        fields = [
            'username',
            'password1',
            'password2'
        ]

class LoginForm(forms.Form):
    username = forms.CharField(label="Username")
    password = forms.CharField(label="Password", widget=forms.PasswordInput)