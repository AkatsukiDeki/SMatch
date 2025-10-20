# study_sessions/models.py
from django.db import models
from django.contrib.auth.models import User

class StudySession(models.Model):
    """Учебная сессия"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    subject = models.ForeignKey('matching.Subject', on_delete=models.CASCADE, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_sessions')
    scheduled_time = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    max_participants = models.IntegerField(default=4)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.scheduled_time}"

    @property
    def subject_name(self):
        return self.subject.name if self.subject else ""

    @property
    def current_participants_count(self):
        return self.participants.filter(is_active=True).count()

    @property
    def available_slots(self):
        return self.max_participants - self.current_participants_count

class SessionParticipant(models.Model):
    """Участник учебной сессии"""
    session = models.ForeignKey(StudySession, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['session', 'user']

    def __str__(self):
        return f"{self.user.username} in {self.session.title}"