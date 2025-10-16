# chat/views.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny  # ДОБАВЛЯЕМ AllowAny
from django.db.models import Q
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer


@api_view(['GET'])
@permission_classes([AllowAny])  # ИСПРАВЛЕНО: AllowAny вместо IsAuthenticated
def health_check(request):
    return Response({"status": "Chat API is working"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_rooms(request):
    """Получить список чатов пользователя"""
    chat_rooms = ChatRoom.objects.filter(
        Q(user1=request.user) | Q(user2=request.user),
        is_active=True
    )
    serializer = ChatRoomSerializer(chat_rooms, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def chat_messages(request, chat_room_id):
    """Получить сообщения чата или отправить новое"""
    try:
        chat_room = ChatRoom.objects.get(
            id=chat_room_id,
            is_active=True
        )
        # Проверяем, что пользователь участник чата
        if request.user not in [chat_room.user1, chat_room.user2]:
            return Response({'error': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)
    except ChatRoom.DoesNotExist:
        return Response({'error': 'Чат не найден'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # Помечаем сообщения как прочитанные
        Message.objects.filter(
            chat_room=chat_room
        ).exclude(sender=request.user).update(is_read=True)

        messages = chat_room.messages.all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(chat_room=chat_room, sender=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_chat_room(request, user_id):
    """Создать чат-комнату с пользователем"""
    from django.contrib.auth.models import User

    try:
        other_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)

    # Создаем или получаем чат-комнату
    chat_room, created = ChatRoom.objects.get_or_create(
        user1=min(request.user, other_user, key=lambda u: u.id),
        user2=max(request.user, other_user, key=lambda u: u.id)
    )

    serializer = ChatRoomSerializer(chat_room, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)