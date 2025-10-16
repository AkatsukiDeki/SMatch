# study_sessions/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('sessions/', views.get_sessions, name='get_sessions'),
    path('my-sessions/', views.get_my_sessions, name='get_my_sessions'),
    path('create/', views.create_session, name='create_session'),
    path('join/<int:session_id>/', views.join_session, name='join_session'),
    path('leave/<int:session_id>/', views.leave_session, name='leave_session'),
    path('delete/<int:session_id>/', views.delete_session, name='delete_session'),
]