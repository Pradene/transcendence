from django.urls import path, include
from . import views

urlpatterns = [
	path('refresh-token/', views.refreshTokenView),

	path('signup/', views.signupView),
	path('login/', views.loginView),
	path('otp/', views.sendOTPView),
	path('otp/verify/', views.validateOTPView),
	path('logout/', views.logoutView),
	
    path('ft_auth/', views.ftAuth),
	path('ft_auth/callback/', views.ftAuthCallback),
]