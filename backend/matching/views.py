# matching/views.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from django.contrib.auth.models import User
from .models import Subject, UserSubject, Swipe, Match
from .serializers import SubjectSerializer, UserSubjectSerializer, SwipeSerializer, MatchSerializer, SimpleProfileSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "Matching API is working"})


@api_view(['GET'])
@permission_classes([AllowAny])  # ИСПРАВЛЕНО: AllowAny вместо IsAuthenticated
def get_subjects(request):
    """Получить список всех предметов"""
    subjects = Subject.objects.all()
    serializer = SubjectSerializer(subjects, many=True)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_subjects(request):
    """Получить или добавить предметы пользователя"""
    if request.method == 'GET':
        user_subjects = UserSubject.objects.filter(user=request.user)
        serializer = UserSubjectSerializer(user_subjects, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = UserSubjectSerializer(data=request.data)
        if serializer.is_valid():
            # Проверяем, не добавлен ли уже этот предмет
            if UserSubject.objects.filter(user=request.user, subject=serializer.validated_data['subject']).exists():
                return Response({'error': 'Этот предмет уже добавлен'}, status=status.HTTP_400_BAD_REQUEST)

            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user_subject(request, subject_id):
    """Удалить предмет у пользователя"""
    try:
        user_subject = UserSubject.objects.get(user=request.user, subject_id=subject_id)
        user_subject.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except UserSubject.DoesNotExist:
        return Response({'error': 'Предмет не найден'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recommendations(request):
    """Получить рекомендации пользователей для мэтчинга"""
    # Базовая логика рекомендаций - пользователи с общих предметов
    user_subjects = UserSubject.objects.filter(user=request.user).values_list('subject', flat=True)

    # Исключаем уже просмотренных пользователей и себя
    swiped_users = Swipe.objects.filter(swiper=request.user).values_list('swiped_user', flat=True)

    recommended_users = User.objects.exclude(
        Q(id=request.user.id) |
        Q(id__in=swiped_users)
    ).filter(
        user_subjects__subject__in=user_subjects
    ).distinct()[:10]  # Ограничиваем 10 рекомендациями

    # Создаем список профилей для сериализации
    profiles_data = []
    for user in recommended_users:
        try:
            profile = user.profile
            profiles_data.append({
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'faculty': profile.faculty,
                'year_of_study': profile.year_of_study,
                'bio': profile.bio
            })
        except:
            # Если профиль не существует, пропускаем пользователя
            continue

    serializer = SimpleProfileSerializer(profiles_data, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def swipe(request, user_id):
    """Сделать свайп (лайк/пас) на пользователя"""
    try:
        swiped_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)

    if request.user.id == user_id:
        return Response({'error': 'Нельзя свайпнуть себя'}, status=status.HTTP_400_BAD_REQUEST)

    action = request.data.get('action')
    if action not in ['like', 'pass']:
        return Response({'error': 'Неверное действие. Используйте like или pass'}, status=status.HTTP_400_BAD_REQUEST)

    # Проверяем, не свайпали ли уже этого пользователя
    if Swipe.objects.filter(swiper=request.user, swiped_user=swiped_user).exists():
        return Response({'error': 'Вы уже свайпали этого пользователя'}, status=status.HTTP_400_BAD_REQUEST)

    # Создаем свайп
    swipe = Swipe.objects.create(
        swiper=request.user,
        swiped_user=swiped_user,
        action=action
    )

    # Если это взаимный лайк - создаем мэтч
    if action == 'like':
        mutual_swipe = Swipe.objects.filter(
            swiper=swiped_user,
            swiped_user=request.user,
            action='like'
        ).first()

        if mutual_swipe:
            # Создаем мэтч
            match = Match.objects.create(
                user1=request.user,
                user2=swiped_user
            )
            return Response({
                'swipe': SwipeSerializer(swipe).data,
                'match_created': True,
                'match': MatchSerializer(match, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)

    return Response({
        'swipe': SwipeSerializer(swipe).data,
        'match_created': False
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_matches(request):
    """Получить список мэтчей пользователя"""
    matches = Match.objects.filter(
        Q(user1=request.user) | Q(user2=request.user),
        is_active=True
    )
    serializer = MatchSerializer(matches, many=True, context={'request': request})
    return Response(serializer.data)