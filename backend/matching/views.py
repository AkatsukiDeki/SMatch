from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Subject, UserSubject, Swipe, Match
from .serializers import SubjectSerializer, UserSubjectSerializer, SwipeSerializer, MatchSerializer
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
def get_subjects(request):
    subjects = Subject.objects.all()
    serializer = SubjectSerializer(subjects, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recommendations(request):
    # Исключаем уже просмотренных пользователей
    swiped_users = Swipe.objects.filter(swiper=request.user).values_list('swiped_user', flat=True)

    # Находим пользователей с общими предметами
    user_subjects = UserSubject.objects.filter(user=request.user).values_list('subject', flat=True)
    recommendations = User.objects.exclude(
        id__in=swiped_users
    ).exclude(
        id=request.user.id
    ).filter(
        usersubject__subject__in=user_subjects
    ).distinct()[:10]

    # TODO: Добавить более сложную логику рекомендаций
    from users.serializers import UserSerializer
    serializer = UserSerializer(recommendations, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_matches(request):
    matches = Match.objects.filter(users=request.user, is_active=True)
    serializer = MatchSerializer(matches, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def swipe(request, user_id):
    try:
        swiped_user = User.objects.get(id=user_id)
        liked = request.data.get('liked', True)

        swipe, created = Swipe.objects.get_or_create(
            swiper=request.user,
            swiped_user=swiped_user,
            defaults={'liked': liked}
        )

        # Проверяем взаимный лайк
        if liked:
            mutual_swipe = Swipe.objects.filter(
                swiper=swiped_user,
                swiped_user=request.user,
                liked=True
            ).first()

            if mutual_swipe:
                match = Match.objects.create()
                match.users.add(request.user, swiped_user)
                return Response({
                    'status': 'match',
                    'match_id': match.id
                })

        return Response({'status': 'swipe recorded'})

    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
def health_check(request):
    return JsonResponse({"status": "Users API is working"})

