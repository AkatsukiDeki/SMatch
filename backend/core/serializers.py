from rest_framework import serializers


def get_profile_data(user):
    """Универсальная функция для получения данных профиля"""
    if not user:
        return None

    try:
        profile = user.profile
        return {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'faculty': profile.faculty if hasattr(profile, 'faculty') else '',
            'year_of_study': profile.year_of_study if hasattr(profile, 'year_of_study') else None,
            'study_level': getattr(profile, 'study_level', '') if hasattr(profile, 'study_level') else '',
            'bio': profile.bio if hasattr(profile, 'bio') else ''
        }
    except Exception as e:
        print(f"Error getting profile data for user {user.username}: {e}")
        return {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'faculty': '',
            'year_of_study': None,
            'study_level': '',
            'bio': ''
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