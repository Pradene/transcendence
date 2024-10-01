from django.contrib import admin
from django.urls import path, include

from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/auth/', include('authentication.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/users/', include('account.urls')),
    path('api/games/', include('game.urls')),

    path('api/csrf-token/', views.getCSRFTokenView)
]