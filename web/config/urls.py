from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/chat/', include('chat.urls')),
    path('api/user/', include('account.urls')),
    
    path('api/csrf-token/', views.getCSRFTokenView),

    re_path(r'^.*$', views.base)
]