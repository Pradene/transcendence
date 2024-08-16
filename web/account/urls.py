from django.urls import path

from . import views

urlpatterns = [
    path('signup/', views.userSignupView),
    path('login/', views.userLoginView),
    path('logout/', views.userLogoutView),
    path('get-friends/', views.getFriendsView),
    path('search-users/', views.searchUsersView)
]