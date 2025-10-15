# matching/serializers.py
from rest_framework import serializers
from .models import Subject, UserSubject, Swipe, Match
from pythonProject.backend.users.serializers import UserProfileSerializer


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'description', 'code']


class UserSubjectSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer(read_only=True)
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        source='subject',
        write_only=True
    )

    class Meta:
        model = UserSubject
        fields = ['id', 'subject', 'subject_id', 'level', 'created_at']


class SwipeSerializer(serializers.ModelSerializer):
    swiped_user_profile = UserProfileSerializer(source='swiped_user.profile', read_only=True)

    class Meta:
        model = Swipe
        fields = ['id', 'swiped_user', 'swiped_user_profile', 'action', 'timestamp']
        read_only_fields = ['swiper', 'timestamp']


class MatchSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    other_user_profile = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = ['id', 'user1', 'user2', 'other_user', 'other_user_profile', 'created_at', 'is_active']

    def get_other_user(self, obj):
        request = self.context.get('request')
        if request and request.user:
            if obj.user1 == request.user:
                return obj.user2.id
            else:
                return obj.user1.id
        return None

    def get_other_user_profile(self, obj):
        request = self.context.get('request')
        if request and request.user:
            if obj.user1 == request.user:
                return UserProfileSerializer(obj.user2.profile).data
            else:
                return UserProfileSerializer(obj.user1.profile).data
        return None