from rest_framework import serializers

class SimpleProfileSerializer(serializers.Serializer):
    """Упрощенный сериализатор профиля для всех приложений"""
    id = serializers.IntegerField()
    username = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    faculty = serializers.CharField()
    year_of_study = serializers.IntegerField()
    study_level = serializers.CharField()
    bio = serializers.CharField()

class SimpleSubjectSerializer(serializers.Serializer):
    """Упрощенный сериализатор предмета"""
    id = serializers.IntegerField()
    name = serializers.CharField()
    code = serializers.CharField()