# matching/serializers.py
from rest_framework import serializers
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


class SimpleProfileSerializer(serializers.Serializer):
    """Упрощенный сериализатор профиля для рекомендаций"""
    id = serializers.IntegerField()
    username = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    faculty = serializers.CharField()
    year_of_study = serializers.IntegerField()
    study_level = serializers.CharField()  # ДОБАВЛЯЕМ
    bio = serializers.CharField()


class SwipeSerializer(serializers.ModelSerializer):
    swiped_user_profile = serializers.SerializerMethodField()

    class Meta:
        model = Swipe
        fields = ['id', 'swiped_user', 'swiped_user_profile', 'action', 'timestamp']
        read_only_fields = ['swiper', 'timestamp']

    def get_swiped_user_profile(self, obj):
        try:
            profile = obj.swiped_user.profile
            return SimpleProfileSerializer({
                'id': obj.swiped_user.id,
                'username': obj.swiped_user.username,
                'first_name': obj.swiped_user.first_name,
                'last_name': obj.swiped_user.last_name,
                'faculty': profile.faculty,
                'year_of_study': profile.year_of_study,
                'bio': profile.bio
            }).data
        except:
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
                    profile = obj.user2.profile
                    user = obj.user2
                else:
                    profile = obj.user1.profile
                    user = obj.user1

                return SimpleProfileSerializer({
                    'id': user.id,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'faculty': profile.faculty,
                    'year_of_study': profile.year_of_study,
                    'bio': profile.bio
                }).data
            except:
                return None
        return None