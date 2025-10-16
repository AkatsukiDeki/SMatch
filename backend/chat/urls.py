from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('rooms/', views.get_chat_rooms, name='get_chat_rooms'),
    path('rooms/create/<int:user_id>/', views.create_chat_room, name='create_chat_room'),
    path('messages/<int:chat_room_id>/', views.chat_messages, name='chat_messages'),
]