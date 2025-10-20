# matching/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('subjects/', views.get_subjects, name='subjects'),
    path('user-subjects/', views.user_subjects, name='user-subjects'),
    path('user-subjects/<int:subject_id>/', views.delete_user_subject, name='delete-user-subject'),
    path('recommendations/', views.get_recommendations, name='recommendations'),
    path('test-recommendations/', views.get_test_recommendations, name='test-recommendations'),
    path('matches/', views.get_matches, name='get-matches'),
    path('swipe/<int:user_id>/', views.swipe, name='swipe'),
    path('health/', views.health_check, name='health_check'),
    path('mutual-likes/', views.get_mutual_likes, name='mutual-likes'),
]