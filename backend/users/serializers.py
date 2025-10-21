from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, University, UserAvatar

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
    study_level = serializers.ReadOnlyField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'id', 'university', 'university_id', 'faculty', 'year_of_study',
            'study_level', 'bio', 'avatar', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_avatar(self, obj):
        try:
            avatar = UserAvatar.objects.get(user=obj.user)
            return UserAvatarSerializer(avatar).data
        except UserAvatar.DoesNotExist:
            return None

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    university_id = serializers.PrimaryKeyRelatedField(
        queryset=University.objects.all(),
        source='university',
        required=False,
        allow_null=True
    )

    class Meta:
        model = UserProfile
        fields = [
            'university_id', 'faculty', 'year_of_study', 'bio'
        ]

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=30)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=30)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'first_name', 'last_name']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Пользователь с таким именем уже существует")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        UserProfile.objects.create(user=user)
        return user

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']

class UserAvatarSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = UserAvatar
        fields = ['id', 'image', 'image_url', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None