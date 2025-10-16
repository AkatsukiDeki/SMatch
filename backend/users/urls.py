## users/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/update/', views.update_profile, name='update_profile'),  # НОВЫЙ
    path('universities/', views.get_universities, name='universities'),  # НОВЫЙ
    path('health/', views.health_check, name='health_check'),
    path('', views.health_check, name='root_health_check'),
]
