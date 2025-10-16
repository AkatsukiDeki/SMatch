# matching/admin.py
from django.contrib import admin
from .models import Subject, UserSubject, Swipe, Match

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'code']  # Убрали 'icon'
    search_fields = ['name', 'code']

@admin.register(UserSubject)
class UserSubjectAdmin(admin.ModelAdmin):
    list_display = ['user', 'subject', 'level']
    list_filter = ['level', 'subject']
    search_fields = ['user__username', 'subject__name']

@admin.register(Swipe)
class SwipeAdmin(admin.ModelAdmin):
    list_display = ['swiper', 'swiped_user', 'action', 'timestamp']
    list_filter = ['action', 'timestamp']
    search_fields = ['swiper__username', 'swiped_user__username']

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['user1', 'user2', 'created_at', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['user1__username', 'user2__username']