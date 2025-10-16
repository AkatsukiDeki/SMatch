# study_sessions/serializers.py
from rest_framework import serializers
from .models import StudySession, SessionParticipant


class SimpleProfileSerializer(serializers.Serializer):
    """Упрощенный сериализатор профиля"""
    id = serializers.IntegerField(source='user.id')
    username = serializers.CharField(source='user.username')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    faculty = serializers.CharField()
    year_of_study = serializers.IntegerField()
    study_level = serializers.CharField()  # ДОБАВЛЯЕМ
    bio = serializers.CharField()


class SimpleSubjectSerializer(serializers.Serializer):
    """Упрощенный сериализатор предмета"""
    id = serializers.IntegerField()
    name = serializers.CharField()
    code = serializers.CharField()


class SessionParticipantSerializer(serializers.ModelSerializer):
    user_profile = serializers.SerializerMethodField()

    class Meta:
        model = SessionParticipant
        fields = ['id', 'user', 'user_profile', 'joined_at', 'is_active']

    def get_user_profile(self, obj):
        try:
            return SimpleProfileSerializer(obj.user.profile).data
        except:
            return None


class StudySessionSerializer(serializers.ModelSerializer):
    subject_info = serializers.SerializerMethodField()
    created_by_profile = serializers.SerializerMethodField()
    participants_count = serializers.ReadOnlyField(source='current_participants_count')
    available_slots = serializers.ReadOnlyField(source='available_slots')
    participants = SessionParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = StudySession
        fields = [
            'id', 'title', 'description', 'subject', 'subject_info',
            'created_by', 'created_by_profile', 'scheduled_time',
            'duration_minutes', 'max_participants', 'participants_count',
            'available_slots', 'participants', 'is_active', 'created_at'
        ]
        read_only_fields = ['created_by', 'created_at']

    def get_subject_info(self, obj):
        if obj.subject:
            return SimpleSubjectSerializer(obj.subject).data
        return None

    def get_created_by_profile(self, obj):
        try:
            return SimpleProfileSerializer(obj.created_by.profile).data
        except:
            return None


class CreateStudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = [
            'title', 'description', 'subject', 'scheduled_time',
            'duration_minutes', 'max_participants'
        ]