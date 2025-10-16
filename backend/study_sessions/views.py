# study_sessions/views.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from django.utils import timezone
from .models import StudySession, SessionParticipant
from .serializers import StudySessionSerializer, CreateStudySessionSerializer, SessionParticipantSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "Study Sessions API is working"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_sessions(request):
    """Получить список учебных сессий"""
    sessions = StudySession.objects.filter(
        is_active=True,
        scheduled_time__gte=timezone.now()
    ).order_by('scheduled_time')
    serializer = StudySessionSerializer(sessions, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_sessions(request):
    """Получить сессии пользователя (созданные или участник)"""
    # Сессии созданные пользователем
    created_sessions = StudySession.objects.filter(created_by=request.user, is_active=True)

    # Сессии где пользователь участник
    participant_sessions = StudySession.objects.filter(
        participants__user=request.user,
        participants__is_active=True,
        is_active=True
    )

    # Объединяем и убираем дубликаты
    sessions = (created_sessions | participant_sessions).distinct().order_by('scheduled_time')
    serializer = StudySessionSerializer(sessions, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_session(request):
    """Создать учебную сессию"""
    serializer = CreateStudySessionSerializer(data=request.data)
    if serializer.is_valid():
        session = serializer.save(created_by=request.user)

        # Автоматически добавляем создателя как участника
        SessionParticipant.objects.create(session=session, user=request.user)

        return Response(StudySessionSerializer(session).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_session(request, session_id):
    """Присоединиться к учебной сессии"""
    try:
        session = StudySession.objects.get(id=session_id, is_active=True)
    except StudySession.DoesNotExist:
        return Response({'error': 'Сессия не найдена'}, status=status.HTTP_404_NOT_FOUND)

    # Проверяем, не присоединен ли уже
    if SessionParticipant.objects.filter(session=session, user=request.user).exists():
        return Response({'error': 'Вы уже присоединены к этой сессии'}, status=status.HTTP_400_BAD_REQUEST)

    # Проверяем лимит участников
    if session.current_participants_count >= session.max_participants:
        return Response({'error': 'Достигнут лимит участников'}, status=status.HTTP_400_BAD_REQUEST)

    # Проверяем, что сессия еще не началась
    if session.scheduled_time <= timezone.now():
        return Response({'error': 'Нельзя присоединиться к начавшейся сессии'}, status=status.HTTP_400_BAD_REQUEST)

    # Присоединяем пользователя
    participant = SessionParticipant.objects.create(session=session, user=request.user)
    return Response({'status': 'Вы присоединились к сессии'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_session(request, session_id):
    """Покинуть учебную сессию"""
    try:
        participant = SessionParticipant.objects.get(
            session_id=session_id,
            user=request.user,
            is_active=True
        )
    except SessionParticipant.DoesNotExist:
        return Response({'error': 'Вы не участник этой сессии'}, status=status.HTTP_404_NOT_FOUND)

    # Создатель не может покинуть сессию (должен удалить её)
    if participant.session.created_by == request.user:
        return Response({'error': 'Создатель не может покинуть сессию'}, status=status.HTTP_400_BAD_REQUEST)

    participant.delete()
    return Response({'status': 'Вы покинули сессию'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_session(request, session_id):
    """Удалить учебную сессию (только создатель)"""
    try:
        session = StudySession.objects.get(id=session_id, created_by=request.user)
    except StudySession.DoesNotExist:
        return Response({'error': 'Сессия не найдена или у вас нет прав'}, status=status.HTTP_404_NOT_FOUND)

    session.is_active = False
    session.save()
    return Response({'status': 'Сессия удалена'})