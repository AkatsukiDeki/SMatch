from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from django.contrib.auth.models import User
from .models import Subject, UserSubject, Swipe, Match
from .serializers import SubjectSerializer, UserSubjectSerializer, SwipeSerializer, MatchSerializer, SimpleProfileSerializer
from chat.models import ChatRoom

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "Matching API is working"})

@api_view(['GET'])
@permission_classes([AllowAny])
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
    """Получить рекомендации пользователей для мэтчинга с фильтрами"""
    # Получаем параметры фильтрации из query parameters
    faculty_filter = request.GET.get('faculty', '')
    year_filter = request.GET.get('year', '')
    subject_id_filter = request.GET.get('subject_id', '')

    try:
        # Базовая логика рекомендаций - пользователи с общих предметов
        user_subjects = UserSubject.objects.filter(user=request.user).values_list('subject', flat=True)

        # Исключаем уже просмотренных пользователей и себя
        swiped_users = Swipe.objects.filter(swiper=request.user).values_list('swiped_user', flat=True)

        recommended_users = User.objects.exclude(
            Q(id=request.user.id) |
            Q(id__in=swiped_users)
        ).filter(
            user_subjects__subject__in=user_subjects
        ).select_related('profile').distinct()

        # Применяем фильтры если они указаны
        if faculty_filter:
            recommended_users = recommended_users.filter(profile__faculty__icontains=faculty_filter)

        if year_filter:
            recommended_users = recommended_users.filter(profile__year_of_study=year_filter)

        if subject_id_filter:
            recommended_users = recommended_users.filter(user_subjects__subject_id=subject_id_filter)

        recommended_users = recommended_users[:10]  # Ограничиваем 10 рекомендациями

        # Создаем список профилей для сериализации
        profiles_data = []
        for user in recommended_users:
            try:
                profile = user.profile
                # Получаем предметы пользователя
                user_subjects_list = UserSubject.objects.filter(user=user).select_related('subject')
                subjects_data = [
                    {
                        'id': us.subject.id,
                        'name': us.subject.name,
                        'level': us.level
                    }
                    for us in user_subjects_list
                ]

                profiles_data.append({
                    'id': user.id,
                    'username': user.username,
                    'first_name': user.first_name or '',
                    'last_name': user.last_name or '',
                    'faculty': profile.faculty,
                    'year_of_study': profile.year_of_study,
                    'study_level': profile.study_level,
                    'bio': profile.bio,
                    'subjects': subjects_data
                })
            except Exception as e:
                print(f"Error processing user {user.username}: {e}")
                continue

        from core.serializers import SimpleProfileSerializer
        serializer = SimpleProfileSerializer(profiles_data, many=True)
        return Response(serializer.data)

    except Exception as e:
        print(f"Error in get_recommendations: {e}")
        return Response({'error': 'Internal server error'}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_test_recommendations(request):
    """Тестовые рекомендации без аутентификации"""
    test_users = [
        {
            'id': 1,
            'username': 'demo_user1',
            'first_name': 'Алексей',
            'last_name': 'Иванов',
            'faculty': 'Факультет информатики',
            'year_of_study': 2,
            'study_level': 'Средний',
            'bio': 'Ищу партнера для изучения программирования',
            'subjects': [
                {'id': 4, 'name': 'Программирование', 'level': 'intermediate'},
                {'id': 2, 'name': 'Математический анализ', 'level': 'beginner'}
            ]
        },
        {
            'id': 2,
            'username': 'demo_user2',
            'first_name': 'Екатерина',
            'last_name': 'Смирнова',
            'faculty': 'Экономический факультет',
            'year_of_study': 3,
            'study_level': 'Продвинутый',
            'bio': 'Помогу с экономикой, ищу помощь с математикой',
            'subjects': [
                {'id': 2, 'name': 'Математический анализ', 'level': 'advanced'},
                {'id': 3, 'name': 'Линейная алгебра', 'level': 'intermediate'}
            ]
        },
        {
            'id': 3,
            'username': 'demo_user3',
            'first_name': 'Дмитрий',
            'last_name': 'Петров',
            'faculty': 'Физический факультет',
            'year_of_study': 1,
            'study_level': 'Начинающий',
            'bio': 'Только начал изучать физику, ищу компанию для совместных занятий',
            'subjects': [
                {'id': 5, 'name': 'Физика', 'level': 'beginner'},
                {'id': 3, 'name': 'Линейная алгебра', 'level': 'beginner'}
            ]
        }
    ]
    return Response(test_users)

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

    # Если это взаимный лайк - создаем мэтч и чат
    if action == 'like':
        mutual_swipe = Swipe.objects.filter(
            swiper=swiped_user,
            swiped_user=request.user,
            action='like'
        ).first()

        if mutual_swipe:
            # Создаем мэтч
            match, match_created = Match.objects.get_or_create(
                user1=min(request.user, swiped_user, key=lambda u: u.id),
                user2=max(request.user, swiped_user, key=lambda u: u.id),
                defaults={'is_active': True}
            )

            # Автоматически создаем чат-комнату
            chat_room, chat_created = ChatRoom.get_or_create_chat(request.user, swiped_user)

            return Response({
                'swipe': SwipeSerializer(swipe).data,
                'match_created': match_created,
                'match': MatchSerializer(match, context={'request': request}).data,
                'chat_room_created': chat_created,
                'chat_room_id': chat_room.id,
                'message': '🎉 Это взаимная симпатия! Чат создан автоматически.'
            }, status=status.HTTP_201_CREATED)

    return Response({
        'swipe': SwipeSerializer(swipe).data,
        'match_created': False,
        'message': 'Лайк отправлен! Ждем ответа.'
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_mutual_likes(request):
    """Получить список взаимных лайков (потенциальные чаты)"""
    # Находим пользователей, которые лайкнули текущего пользователя
    users_who_liked_me = Swipe.objects.filter(
        swiped_user=request.user,
        action='like'
    ).values_list('swiper', flat=True)

    # Находим, кого лайкнул текущий пользователь из этого списка
    mutual_likes = Swipe.objects.filter(
        swiper=request.user,
        swiped_user__in=users_who_liked_me,
        action='like'
    ).select_related('swiped_user', 'swiped_user__profile')

    # Формируем данные для ответа
    mutual_users_data = []
    for swipe in mutual_likes:
        user = swipe.swiped_user
        try:
            profile_data = {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'faculty': user.profile.faculty if hasattr(user, 'profile') else '',
                'year_of_study': user.profile.year_of_study if hasattr(user, 'profile') else None,
                'study_level': user.profile.study_level if hasattr(user, 'profile') else '',
                'bio': user.profile.bio if hasattr(user, 'profile') else ''
            }
            mutual_users_data.append({
                'user': SimpleProfileSerializer(profile_data).data,
                'swipe_id': swipe.id,
                'matched_at': swipe.timestamp
            })
        except Exception as e:
            print(f"Error processing mutual like: {e}")
            continue

    return Response(mutual_users_data)