# users/views.py
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserProfileSerializer,
    UniversitySerializer,  # ДОБАВИТЬ ЭТОТ ИМПОРТ
    UserProfileUpdateSerializer  # ДОБАВИТЬ ЭТОТ ИМПОРТ
)
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import UserProfile, University  # Убедитесь, что University импортирован


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    try:
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)

            # Получаем полные данные пользователя с профилем
            user_data = UserSerializer(user).data

            return Response({
                'user': user_data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        else:
            # Возвращаем детальные ошибки валидации
            return Response({
                'error': 'Ошибка валидации',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({
            'error': f'Ошибка сервера: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            },
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    profile = request.user.userprofile
    serializer = UserProfileSerializer(profile)
    return Response(serializer.data)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return JsonResponse({"status": "Users API is working"})


@api_view(['GET'])
@permission_classes([AllowAny])
def get_universities(request):
    """Получить список университетов"""
    universities = University.objects.all()
    serializer = UniversitySerializer(universities, many=True)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Обновление профиля пользователя и основных данных"""
    try:
        profile = request.user.profile
        user = request.user
    except UserProfile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

    print(f"📥 Получены данные для обновления: {request.data}")

    try:
        # ОБНОВЛЯЕМ ПОЛЬЗОВАТЕЛЯ (User модель)
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        user.save()

        # ОБНОВЛЯЕМ ПРОФИЛЬ (UserProfile модель)
        if 'faculty' in request.data:
            profile.faculty = request.data['faculty']
        if 'year_of_study' in request.data:
            profile.year_of_study = request.data['year_of_study']
        if 'bio' in request.data:
            profile.bio = request.data['bio']
        if 'university_id' in request.data:
            profile.university_id = request.data['university_id']

        profile.save()

        print("✅ Профиль и пользователь успешно обновлены")

        # Возвращаем обновленные данные
        from django.contrib.auth.models import User
        updated_user = User.objects.select_related('profile').get(id=user.id)

        response_data = {
            'id': updated_user.id,
            'username': updated_user.username,
            'email': updated_user.email,
            'first_name': updated_user.first_name,
            'last_name': updated_user.last_name,
            'profile': {
                'id': updated_user.profile.id,
                'faculty': updated_user.profile.faculty,
                'year_of_study': updated_user.profile.year_of_study,
                'study_level': updated_user.profile.study_level,
                'bio': updated_user.profile.bio,
                'university': {
                    'id': updated_user.profile.university.id if updated_user.profile.university else None,
                    'name': updated_user.profile.university.name if updated_user.profile.university else None,
                } if updated_user.profile.university else None
            }
        }

        return Response(response_data)

    except Exception as e:
        print(f"❌ Ошибка при обновлении: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)