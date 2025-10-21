from django.db import models
from django.contrib.auth.models import User

class StudySession(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    subject = models.ForeignKey('matching.Subject', on_delete=models.SET_NULL, null=True, blank=True)
    subject_name = models.CharField(max_length=100, blank=True, default="")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_sessions')
    scheduled_time = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    max_participants = models.IntegerField(default=4)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.subject and not self.subject_name:
            self.subject_name = self.subject.name
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.scheduled_time}"

    @property
    def current_participants_count(self):
        return self.participants.filter(is_active=True).count()

    @property
    def available_slots(self):
        return self.max_participants - self.current_participants_count

class SessionParticipant(models.Model):
    session = models.ForeignKey(StudySession, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['session', 'user']

    def __str__(self):
        return f"{self.user.username} in {self.session.title}"

class SessionInvitation(models.Model):
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

    def __str__(self):
        return f"Invitation: {self.inviter} -> {self.invitee} for {self.session}"