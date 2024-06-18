from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from .forms import LoginForm, SignupForm

def userSignup(request):
    if request.method == 'POST':
        form = SignupForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('login')
    else:
        form = SignupForm()

    return render(request, 'account/signup.html', {'form': form})

def userLogin(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user:
                login(request, user)
                return redirect('profile')
    else:
        form = LoginForm()

    return render(request, 'account/login.html', {'form': form})

def userLogout(request):
    logout(request)
    return redirect('login')

def profile(request):
    if not request.user.is_authenticated:
        return redirect('login')

    return render(request, 'account/profile.html')
