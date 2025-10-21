from rest_framework import serializers
from core.serializers import SimpleProfileSerializer, SimpleSubjectSerializer, get_profile_data
from .models import Subject, UserSubject, Swipe, Match

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
    swiped_user_profile = serializers.SerializerMethodField()

    class Meta:
        model = Swipe
        fields = ['id', 'swiped_user', 'swiped_user_profile', 'action', 'timestamp']
        read_only_fields = ['swiper', 'timestamp']

    def get_swiped_user_profile(self, obj):
        profile_data = get_profile_data(obj.swiped_user)
        return SimpleProfileSerializer(profile_data).data if profile_data else None

class MatchSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    other_user_profile = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = ['id', 'user1', 'user2', 'other_user', 'other_user_profile', 'created_at', 'is_active']

    def get_other_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user2.id if obj.user1 == request.user else obj.user1.id
        return None

    def get_other_user_profile(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            other_user = obj.user2 if obj.user1 == request.user else obj.user1
            profile_data = get_profile_data(other_user)
            return SimpleProfileSerializer(profile_data).data if profile_data else None
        return None