import logging
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from django.conf import settings
from .models import UserProfile, University, UserAvatar
from .serializers import (
    UserRegistrationSerializer, UserSerializer,
    UserProfileUpdateSerializer, UniversitySerializer,
    UserAvatarSerializer
)

logger = logging.getLogger(__name__)


# Класс-based view для профиля
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# Функция-based views
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    try:
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)

            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """Получить профиль текущего пользователя"""
    try:
        user_data = UserSerializer(request.user).data
        return Response(user_data)
    except Exception as e:
        logger.error(f"Get profile error: {str(e)}")
        return Response({'error': 'Internal server error'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Обновление профиля пользователя"""
    try:
        user = request.user
        profile = user.profile

        # Обновляем данные пользователя
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        user.save()

        # Обновляем профиль
        serializer = UserProfileUpdateSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            updated_user = User.objects.get(id=user.id)
            return Response(UserSerializer(updated_user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Update profile error: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_universities(request):
    """Получить список университетов"""
    try:
        universities = University.objects.all()
        serializer = UniversitySerializer(universities, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Get universities error: {str(e)}")
        return Response({'error': 'Internal server error'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_avatar(request):
    """Загрузка аватарки пользователя"""
    try:
        if 'avatar' not in request.FILES:
            return Response({'error': 'Файл не найден'}, status=status.HTTP_400_BAD_REQUEST)

        avatar_file = request.FILES['avatar']

        # Создаем или обновляем аватар
        avatar, created = UserAvatar.objects.get_or_create(user=request.user)

        # Удаляем старый файл если есть
        if avatar.image:
            avatar.image.delete(save=False)

        avatar.image.save(avatar_file.name, ContentFile(avatar_file.read()))
        avatar.save()

        serializer = UserAvatarSerializer(avatar)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_avatar(request):
    """Удаление аватарки пользователя"""
    try:
        avatar = UserAvatar.objects.get(user=request.user)
        avatar.image.delete(save=True)
        avatar.delete()
        return Response({'message': 'Аватар удален'})
    except UserAvatar.DoesNotExist:
        return Response({'error': 'Аватар не найден'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "Users API is working"})