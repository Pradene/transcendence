from django.urls import path, include
from . import views

urlpatterns = [
	path('friend-requests/', views.getFriendRequestsView),
	path('<int:user_id>/friend-requests/', views.getFriendRequestsView),

    path('search/', views.searchUsersView),
    
    path('friends/', views.getFriendsView),
    path('<int:user_id>/friends/', views.getFriendsView),
    
    path('', views.userView),
    path('<int:user_id>/', views.userView),
    path('levelinfo/<int:user_id>', views.userLevel),

    path('language/', views.getLanguage),
]
