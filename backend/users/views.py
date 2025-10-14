from rest_framework import status, generics, permissions  # ← ДОБАВЬТЕ status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import UserRegistrationSerializer, UserSerializer, UserProfileSerializer
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import UserProfile

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserProfileSerializer(user.userprofile).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)  # ← Теперь status определен
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  # ← И здесь

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserProfileSerializer(user.userprofile).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)  # ← И здесь

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