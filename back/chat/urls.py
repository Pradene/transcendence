from django.urls import path
from . import views

urlpatterns = [
    path('get-chatrooms/', views.get_chatrooms),
    path('search-chatroom/', views.search_chatroom),
]