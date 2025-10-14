from django.contrib import admin
from .models import StudySession, SessionParticipant

@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    list_display = ['title', 'creator', 'subject', 'scheduled_time', 'is_online', 'participant_count']
    list_filter = ['subject', 'is_online', 'scheduled_time']
    search_fields = ['title', 'description', 'creator__username']
    date_hierarchy = 'scheduled_time'

@admin.register(SessionParticipant)
class SessionParticipantAdmin(admin.ModelAdmin):
    list_display = ['user', 'session', 'joined_at']
    list_filter = ['joined_at']
    search_fields = ['user__username', 'session__title']