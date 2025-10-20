# users/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, University
from core.serializers import SimpleProfileSerializer, SimpleSubjectSerializer


class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ['id', 'name', 'short_name', 'city', 'website']


class UserProfileSerializer(serializers.ModelSerializer):
    university = UniversitySerializer(read_only=True)
    university_id = serializers.PrimaryKeyRelatedField(
        queryset=University.objects.all(),
        source='university',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = UserProfile
        fields = [
            'id', 'university', 'university_id', 'faculty',
            'year_of_study', 'bio', 'telegram', 'whatsapp', 'phone',
            'show_contact_info'
        ]


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'university', 'faculty', 'year_of_study', 'bio',
            'telegram', 'whatsapp', 'phone', 'show_contact_info'
        ]


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        # Создаем профиль пользователя
        UserProfile.objects.create(user=user)
        return user


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']


class UserProfileSerializer(serializers.ModelSerializer):
    university = UniversitySerializer(read_only=True)
    university_id = serializers.PrimaryKeyRelatedField(
        queryset=University.objects.all(),
        source='university',
        write_only=True,
        required=False,
        allow_null=True
    )
    study_level = serializers.ReadOnlyField()  # Добавляем вычисляемое поле

    class Meta:
        model = UserProfile
        fields = [
            'university', 'faculty', 'year_of_study', 'bio',
            'telegram', 'whatsapp', 'phone', 'show_contact_info'
        ]
        extra_kwargs = {
            'university': {'required': False},
            'faculty': {'required': False},
            'year_of_study': {'required': False},
            'bio': {'required': False},
        }