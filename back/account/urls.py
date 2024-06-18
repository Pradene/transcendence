from django.urls import path

from . import views

urlpatterns = [
    path('signup/', views.userSignup, name="signup"),
    path('login/', views.userLogin, name="login"),
    path('logout/', views.userLogout, name="logout"),
    path('profile/', views.profile, name="profile"),
]