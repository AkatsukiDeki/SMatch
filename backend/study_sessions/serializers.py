# study_sessions/serializers.py
from rest_framework import serializers
from core.serializers import SimpleProfileSerializer, SimpleSubjectSerializer
from .models import StudySession, SessionParticipant

class SessionParticipantSerializer(serializers.ModelSerializer):
    user_profile = serializers.SerializerMethodField()

    class Meta:
        model = SessionParticipant
        fields = ['id', 'user', 'user_profile', 'joined_at', 'is_active']

    def get_user_profile(self, obj):
        try:
            profile_data = {
                'id': obj.user.id,
                'username': obj.user.username,
                'first_name': obj.user.first_name,
                'last_name': obj.user.last_name,
                'faculty': obj.user.profile.faculty if hasattr(obj.user, 'profile') else '',
                'year_of_study': obj.user.profile.year_of_study if hasattr(obj.user, 'profile') else None,
                'study_level': obj.user.profile.study_level if hasattr(obj.user, 'profile') else '',
                'bio': obj.user.profile.bio if hasattr(obj.user, 'profile') else ''
            }
            return SimpleProfileSerializer(profile_data).data
        except Exception as e:
            print(f"Error getting user profile: {e}")
            return None

class StudySessionSerializer(serializers.ModelSerializer):
    subject_info = serializers.SerializerMethodField()
    created_by_profile = serializers.SerializerMethodField()
    participants_count = serializers.ReadOnlyField()  # УБРАТЬ source
    available_slots = serializers.ReadOnlyField()     # УБРАТЬ source
    participants = SessionParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = StudySession
        fields = [
            'id', 'title', 'description', 'subject_name', 'subject_info',
            'created_by', 'created_by_profile', 'scheduled_time',
            'duration_minutes', 'max_participants', 'participants_count',
            'available_slots', 'participants', 'is_active', 'created_at'
        ]
        read_only_fields = ['created_by', 'created_at']

    def get_subject_info(self, obj):
        # Если используем subject_name, то возвращаем его
        if obj.subject_name:
            return {'name': obj.subject_name}
        return None

    def get_created_by_profile(self, obj):
        try:
            profile_data = {
                'id': obj.created_by.id,
                'username': obj.created_by.username,
                'first_name': obj.created_by.first_name,
                'last_name': obj.created_by.last_name,
                'faculty': obj.created_by.profile.faculty if hasattr(obj.created_by, 'profile') else '',
                'year_of_study': obj.created_by.profile.year_of_study if hasattr(obj.created_by, 'profile') else None,
                'study_level': obj.created_by.profile.study_level if hasattr(obj.created_by, 'profile') else '',
                'bio': obj.created_by.profile.bio if hasattr(obj.created_by, 'profile') else ''
            }
            return SimpleProfileSerializer(profile_data).data
        except Exception as e:
            print(f"Error getting created by profile: {e}")
            return None

class CreateStudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = [
            'title', 'description', 'subject_name', 'scheduled_time',
            'duration_minutes', 'max_participants'
        ]