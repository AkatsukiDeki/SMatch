# matching/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('subjects/', views.get_subjects, name='subjects'),
    path('recommendations/', views.get_recommendations, name='recommendations'),
    path('swipe/<int:user_id>/', views.swipe, name='swipe'),
    path('health/', views.health_check, name='health_check'),
]