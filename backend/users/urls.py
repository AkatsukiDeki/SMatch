from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),  # было: registration_view
    path('login/', views.login, name='login'),           # было: login_view
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('health/', views.health_check, name='health_check'),
]f