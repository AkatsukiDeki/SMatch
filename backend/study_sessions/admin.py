from django.contrib import admin
from .models import StudySession, SessionParticipant, SessionInvitation

@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    list_display = ['title', 'subject_name', 'created_by', 'scheduled_time', 'max_participants', 'is_active']
    list_filter = ['is_active', 'scheduled_time']
    search_fields = ['title', 'description', 'created_by__username']

@admin.register(SessionParticipant)
class SessionParticipantAdmin(admin.ModelAdmin):
    list_display = ['user', 'session', 'joined_at', 'is_active']
    list_filter = ['is_active', 'joined_at']
    search_fields = ['user__username', 'session__title']

@admin.register(SessionInvitation)
class SessionInvitationAdmin(admin.ModelAdmin):
    list_display = ['session', 'inviter', 'invitee', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['session__title', 'inviter__username', 'invitee__username']