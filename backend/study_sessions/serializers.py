from rest_framework import serializers
from core.serializers import SimpleProfileSerializer, get_profile_data
from .models import StudySession, SessionParticipant

class SessionParticipantSerializer(serializers.ModelSerializer):
    user_profile = serializers.SerializerMethodField()

    class Meta:
        model = SessionParticipant
        fields = ['id', 'user', 'user_profile', 'joined_at', 'is_active']

    def get_user_profile(self, obj):
        profile_data = get_profile_data(obj.user)
        return SimpleProfileSerializer(profile_data).data if profile_data else None

class StudySessionSerializer(serializers.ModelSerializer):
    subject_info = serializers.SerializerMethodField()
    created_by_profile = serializers.SerializerMethodField()
    participants_count = serializers.SerializerMethodField()
    available_slots = serializers.SerializerMethodField()
    participants = SessionParticipantSerializer(many=True, read_only=True)
    subject_name = serializers.CharField(read_only=True)

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
        return None

    def get_created_by_profile(self, obj):
        profile_data = get_profile_data(obj.created_by)
        return SimpleProfileSerializer(profile_data).data if profile_data else None

    def get_participants_count(self, obj):
        return obj.current_participants_count

    def get_available_slots(self, obj):
        return obj.available_slots

class CreateStudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = [
            'title', 'description', 'subject', 'scheduled_time',
            'duration_minutes', 'max_participants'
        ]