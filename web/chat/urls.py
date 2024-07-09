from django.urls import path
from . import views

urlpatterns = [
    path('rooms/', views.get_rooms),
    path('rooms/<int:room_id>/', views.get_room),
    path('search-rooms/', views.search_rooms),
]