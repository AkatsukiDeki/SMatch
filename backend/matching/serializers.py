from rest_framework import serializers
from .models import Subject, UserSubject, Swipe, Match
from users.serializers import UserSerializer


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'description', 'icon']


class UserSubjectSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer(read_only=True)

    class Meta:
        model = UserSubject
        fields = ['id', 'subject', 'level']


class SwipeSerializer(serializers.ModelSerializer):
    swiped_user_info = UserSerializer(source='swiped_user', read_only=True)

    class Meta:
        model = Swipe
        fields = ['id', 'swiped_user', 'swiped_user_info', 'liked', 'timestamp']


class MatchSerializer(serializers.ModelSerializer):
    users = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Match
        fields = ['id', 'users', 'created_at', 'is_active']