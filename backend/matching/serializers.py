# matching/serializers.py
from rest_framework import serializers
from core.serializers import SimpleProfileSerializer, SimpleSubjectSerializer
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
        try:
            profile_data = {
                'id': obj.swiped_user.id,
                'username': obj.swiped_user.username,
                'first_name': obj.swiped_user.first_name,
                'last_name': obj.swiped_user.last_name,
                'faculty': obj.swiped_user.profile.faculty if hasattr(obj.swiped_user, 'profile') else '',
                'year_of_study': obj.swiped_user.profile.year_of_study if hasattr(obj.swiped_user, 'profile') else None,
                'study_level': obj.swiped_user.profile.study_level if hasattr(obj.swiped_user, 'profile') else '',
                'bio': obj.swiped_user.profile.bio if hasattr(obj.swiped_user, 'profile') else ''
            }
            return SimpleProfileSerializer(profile_data).data
        except Exception as e:
            print(f"Error getting swiped user profile: {e}")
            return None

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
            try:
                if obj.user1 == request.user:
                    user = obj.user2
                else:
                    user = obj.user1

                profile_data = {
                    'id': user.id,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'faculty': user.profile.faculty if hasattr(user, 'profile') else '',
                    'year_of_study': user.profile.year_of_study if hasattr(user, 'profile') else None,
                    'study_level': user.profile.study_level if hasattr(user, 'profile') else '',
                    'bio': user.profile.bio if hasattr(user, 'profile') else ''
                }
                return SimpleProfileSerializer(profile_data).data
            except Exception as e:
                print(f"Error getting other user profile: {e}")
                return None
        return None