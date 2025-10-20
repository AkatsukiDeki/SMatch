# core/serializers.py
from rest_framework import serializers

class SimpleProfileSerializer(serializers.Serializer):
    """Упрощенный сериализатор профиля без зависимостей"""
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