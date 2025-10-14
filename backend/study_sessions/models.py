from django.db import models
from django.contrib.auth.models import User

class StudySession(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_sessions')
    title = models.CharField(max_length=200)
    subject = models.ForeignKey('matching.Subject', on_delete=models.CASCADE)
    description = models.TextField()
    scheduled_time = models.DateTimeField()
    duration = models.DurationField()
    max_participants = models.IntegerField(default=2)
    is_online = models.BooleanField(default=True)
    meeting_link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} by {self.creator.username}"

    @property
    def participant_count(self):
        return self.sessionparticipant_set.count()

    @property
    def available_spots(self):
        return self.max_participants - self.participant_count

    def is_full(self):
        return self.participant_count >= self.max_participants


class SessionParticipant(models.Model):
    session = models.ForeignKey(StudySession, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['session', 'user']

    def __str__(self):
        return f"{self.user.username} in {self.session.title}"