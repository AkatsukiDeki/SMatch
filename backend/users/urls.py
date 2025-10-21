from django.urls import path
from . import views

urlpatterns = [
    # Аутентификация
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),

    # Профиль
    path('profile/', views.get_profile, name='profile'),
    path('profile/update/', views.update_profile, name='update_profile'),

    # Дополнительные endpoints
    path('universities/', views.get_universities, name='universities'),
    path('upload-avatar/', views.upload_avatar, name='upload_avatar'),
    path('delete-avatar/', views.delete_avatar, name='delete_avatar'),

    # Health check
    path('health/', views.health_check, name='health_check'),
]