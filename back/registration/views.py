from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login as auth_login
from django.shortcuts import render, redirect

def login(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, request.POST)
        if form.is_valid():
            auth_login(request, form.get_user())
            return redirect('profile')
    else:
        form = AuthenticationForm(request)

    if request.user.is_authenticated:
        return redirect('profile')

    return render(request, 'registration/login.html', {'form': form})

def signup(request):
    return render(request, 'registration/signup.html')

def profile(request):
    return render(request, 'registration/profile.html')
