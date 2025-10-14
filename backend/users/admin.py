from django.contrib import admin
from .models import UserProfile, Subject, University

# Регистрируем модель University
@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'website']
    search_fields = ['name', 'city']

# Убедитесь, что остальные модели также зарегистрированы
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'university', 'study_level']
    list_filter = ['study_level', 'university']

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
