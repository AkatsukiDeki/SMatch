from django.db import models
from django.contrib.auth.models import User


class Subject(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class UserSubject(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Начинающий'),
        ('intermediate', 'Средний'),
        ('advanced', 'Продвинутый'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    subject = models.ForeignKey('Subject', on_delete=models.CASCADE)  # ← ИСПРАВЛЕНО
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')

    class Meta:
        unique_together = ['user', 'subject']

    def __str__(self):
        return f"{self.user.username} - {self.subject.name} ({self.level})"


class Swipe(models.Model):
    swiper = models.ForeignKey(User, on_delete=models.CASCADE, related_name='swipes_made')
    swiped_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='swipes_received')
    liked = models.BooleanField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['swiper', 'swiped_user']

    def __str__(self):
        return f"{self.swiper.username} -> {self.swiped_user.username} : {'like' if self.liked else 'dislike'}"


class Match(models.Model):
    users = models.ManyToManyField(User, related_name='matches')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Match between {', '.join([user.username for user in self.users.all()])}"