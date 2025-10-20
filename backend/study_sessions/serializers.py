# study_sessions/serializers.py
from rest_framework import serializers
from .models import StudySession, SessionParticipant


class SessionParticipantSerializer(serializers.ModelSerializer):
    user_profile = serializers.SerializerMethodField()

    class Meta:
        model = SessionParticipant
        fields = ['id', 'user', 'user_profile', 'joined_at', 'is_active']

    def get_user_profile(self, obj):
        try:
            from core.serializers import SimpleProfileSerializer

            profile_data = {
                'id': obj.user.id,
                'username': obj.user.username,
                'first_name': obj.user.first_name or '',
                'last_name': obj.user.last_name or '',
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
    participants_count = serializers.SerializerMethodField()
    available_slots = serializers.SerializerMethodField()
    participants = SessionParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = StudySession
        fields = [
            'id', 'title', 'description', 'subject', 'subject_name', 'subject_info',
            'created_by', 'created_by_profile', 'scheduled_time',
            'duration_minutes', 'max_participants', 'participants_count',
            'available_slots', 'participants', 'is_active', 'created_at'
        ]
        read_only_fields = ['created_by', 'created_at']

    def get_subject_info(self, obj):
        if obj.subject:
            return {'id': obj.subject.id, 'name': obj.subject.name}
        return {'name': obj.subject_name} if obj.subject_name else None

    def get_created_by_profile(self, obj):
        try:
            from core.serializers import SimpleProfileSerializer

            profile_data = {
                'id': obj.created_by.id,
                'username': obj.created_by.username,
                'first_name': obj.created_by.first_name or '',
                'last_name': obj.created_by.last_name or '',
                'faculty': obj.created_by.profile.faculty if hasattr(obj.created_by, 'profile') else '',
                'year_of_study': obj.created_by.profile.year_of_study if hasattr(obj.created_by, 'profile') else None,
                'study_level': obj.created_by.profile.study_level if hasattr(obj.created_by, 'profile') else '',
                'bio': obj.created_by.profile.bio if hasattr(obj.created_by, 'profile') else ''
            }
            return SimpleProfileSerializer(profile_data).data
        except Exception as e:
            print(f"Error getting created by profile: {e}")
            return None

    def get_participants_count(self, obj):
        return obj.current_participants_count

    def get_available_slots(self, obj):
        return obj.available_slots


class CreateStudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = [
            'title', 'description', 'subject', 'subject_name', 'scheduled_time',
            'duration_minutes', 'max_participants'
        ]