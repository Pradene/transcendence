from django.urls import path

from . import views

urlpatterns = [
    path('signup/', views.signupView),
    path('login/', views.loginView),
    path('logout/', views.logoutView),
    path('check-login/', views.checkLoginView),
    path('refresh-token/', views.refreshTokenView),

    path('friends/', views.getFriendsView),

    path('friend-requests/', views.getFriendRequestsView),
    path('friend-requests/<int:user_id>/', views.sendFriendRequestView),
    path('friend-requests/<int:user_id>/accept/', views.acceptFriendRequestView),
    # path('friend-requests/<int:user_id>/decline/', views.declineFriendRequestView)

    path('', views.searchUsersView),
]