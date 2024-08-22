from django.urls import path
from . import views

urlpatterns = [
    path('rooms/', views.roomsView),
    path('rooms/<int:room_id>/', views.roomView),
    # path('search-rooms/', views.searchRoomsView),
]