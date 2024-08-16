from django.urls import path
from . import views

urlpatterns = [
    path('rooms/', views.getRoomsView),
    path('rooms/<int:room_id>/', views.getRoomView),
    path('search-rooms/', views.searchRoomsView),
]