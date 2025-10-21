from django.urls import path
from . import views

urlpatterns = [
    # Health check
    path('health/', views.health_check, name='health_check'),

    # Сессии
    path('sessions/', views.get_sessions, name='get_sessions'),
    path('my-sessions/', views.get_my_sessions, name='get_my_sessions'),
    path('create/', views.create_session, name='create_session'),
    path('join/<int:session_id>/', views.join_session, name='join_session'),
    path('leave/<int:session_id>/', views.leave_session, name='leave_session'),
    path('delete/<int:session_id>/', views.delete_session, name='delete_session'),

    # Приглашения
    path('invitations/', views.get_invitations, name='get_invitations'),
    path('invitations/send/', views.send_invitation, name='send_invitation'),
    path('invitations/<int:invitation_id>/respond/', views.respond_to_invitation, name='respond_to_invitation'),

    # Участники
    path('sessions/<int:session_id>/participants/', views.get_session_participants, name='get_session_participants'),
]