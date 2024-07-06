from django.urls import path

from . import views

urlpatterns = [
    path('signup/', views.user_signup),
    path('login/', views.user_login),
    
    path('get-friends/', views.get_friends),
    path('search-users/', views.search_users),
]