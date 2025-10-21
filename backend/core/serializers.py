from rest_framework import serializers


def get_profile_data(user):
    """Универсальная функция для получения данных профиля"""
    if not user or not hasattr(user, 'profile'):
        return None

    return {
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name or '',
        'last_name': user.last_name or '',
        'faculty': user.profile.faculty,
        'year_of_study': user.profile.year_of_study,
        'study_level': user.profile.study_level,
        'bio': user.profile.bio
    }


class SimpleProfileSerializer(serializers.Serializer):
    """Упрощенный сериализатор профиля"""
    id = serializers.IntegerField()
    username = serializers.CharField()
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    faculty = serializers.CharField(required=False, allow_blank=True)
    year_of_study = serializers.IntegerField(required=False, allow_null=True)
    study_level = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)


class SimpleSubjectSerializer(serializers.Serializer):
    """Упрощенный сериализатор предмета"""
    id = serializers.IntegerField()
    name = serializers.CharField()
    code = serializers.CharField(required=False, allow_blank=True)