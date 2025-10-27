from django.db import models
from django.contrib.auth.models import User

class StudySession(models.Model):
    """Учебная сессия"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    subject = models.ForeignKey('matching.Subject', on_delete=models.CASCADE, null=True, blank=True)
    subject_name = models.CharField(max_length=100, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_sessions')
    scheduled_time = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    max_participants = models.IntegerField(default=4)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.scheduled_time}"

    @property
    def current_participants_count(self):
        return self.participants.filter(is_active=True).count()

    @property
    def available_slots(self):
        return self.max_participants - self.current_participants_count

    def save(self, *args, **kwargs):
        if self.subject and not self.subject_name:
            self.subject_name = self.subject.name
        elif not self.subject and not self.subject_name:
            self.subject_name = "Совместное обучение"
        super().save(*args, **kwargs)

    class Meta:
        indexes = [
            models.Index(fields=['is_active', 'scheduled_time']),
            models.Index(fields=['created_by']),
        ]

class SessionParticipant(models.Model):
    """Участник учебной сессии"""
    session = models.ForeignKey(StudySession, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['session', 'user']
        indexes = [
            models.Index(fields=['session', 'is_active']),
        ]

    def __str__(self):
        return f"{self.user.username} in {self.session.title}"

class SessionInvitation(models.Model):
    """Приглашение на учебную сессию"""
    STATUS_CHOICES = [
        ('pending', 'Ожидает ответа'),
        ('accepted', 'Принято'),
        ('declined', 'Отклонено')
    ]

    session = models.ForeignKey(StudySession, on_delete=models.CASCADE, related_name='invitations')
    inviter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invitations')
    invitee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_invitations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['session', 'invitee']
        indexes = [
            models.Index(fields=['invitee', 'status']),
        ]

    def __str__(self):
        return f"Invitation: {self.inviter} -> {self.invitee} for {self.session}"