from django.urls import path, include
from . import views

urlpatterns = [
    path('signup/', views.signupView),
    path('login/', views.loginView),
    path('logout/', views.logoutView),
    path('check-login/', views.checkLoginView),
    path('refresh-token/', views.refreshTokenView),


    path('friend-requests/', views.getFriendRequestsView),
    # path('friend-requests/<int:user_id>/', views.sendFriendRequestView),
    # path('friend-requests/<int:user_id>/accept/', views.acceptFriendRequestView),
    # path('friend-requests/<int:user_id>/decline/', views.declineFriendRequestView)

    path('search/', views.searchUsersView),
    
    path('friends/', views.getFriendsView),
    path('<int:user_id>/friends/', views.getFriendsView),
    
    path('', views.userView),
    path('<int:user_id>/', views.userView),
]