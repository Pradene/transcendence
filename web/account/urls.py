from django.urls import path

from . import views

urlpatterns = [
    path('signup/', views.userSignupView),
    path('login/', views.userLoginView),
    path('logout/', views.userLogoutView),
    path('refresh-token/', views.refreshTokenView),

    path('search-users/', views.searchUsersView),

    path('friends/', views.getFriendsView),
    path('friend-requests/', views.getFriendRequestsView),
    path('friend-requests/<int:user_id>/', views.sendFriendRequestView),
    path('friend-requests/<int:user_id>/accept/', views.acceptFriendRequestView)
]