# matching/models.py
from django.db import models
from django.contrib.auth.models import User

class Subject(models.Model):
    """Модель учебного предмета"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    code = models.CharField(max_length=20, unique=True, blank=True)

    def __str__(self):
        return self.name

class UserSubject(models.Model):
    """Связь пользователя с предметом и его уровнем знаний"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_subjects')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

    LEVEL_CHOICES = [
        ('beginner', 'Начинающий'),
        ('intermediate', 'Средний'),
        ('advanced', 'Продвинутый'),
    ]

    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    # ВРЕМЕННО УБИРАЕМ created_at
    # created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'subject']

    def __str__(self):
        return f"{self.user.username} - {self.subject.name} ({self.level})"

class Swipe(models.Model):
    """Модель для свайпов (лайков/дизлайков)"""
    swiper = models.ForeignKey(User, on_delete=models.CASCADE, related_name='swipes_made')
    swiped_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='swipes_received')

    ACTION_CHOICES = [
        ('like', 'Like'),
        ('pass', 'Pass'),
    ]

    action = models.CharField(max_length=10, choices=ACTION_CHOICES, default='like')  # Добавляем default
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['swiper', 'swiped_user']

    def __str__(self):
        return f"{self.swiper.username} -> {self.swiped_user.username} ({self.action})"

class Match(models.Model):
    """Модель мэтча между пользователями"""
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='matches_as_user1', null=True, blank=True)
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='matches_as_user2', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['user1', 'user2']

    def __str__(self):
        if self.user1 and self.user2:
            return f"Match: {self.user1.username} & {self.user2.username}"
        return "Match (incomplete)"