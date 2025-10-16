# users/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class University(models.Model):
    name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=50, blank=True)
    city = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    YEAR_CHOICES = [
        (1, '1 курс'),
        (2, '2 курс'),
        (3, '3 курс'),
        (4, '4 курс'),
        (5, '5 курс'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    university = models.ForeignKey(University, on_delete=models.SET_NULL, null=True, blank=True)
    faculty = models.CharField(max_length=100, blank=True)
    year_of_study = models.IntegerField(choices=YEAR_CHOICES, null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    telegram = models.CharField(max_length=50, blank=True)
    whatsapp = models.CharField(max_length=50, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    show_contact_info = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def study_level(self):
        """Вычисляемый уровень обучения на основе курса"""
        if not self.year_of_study:
            return "Не указано"
        elif self.year_of_study == 1:
            return "Начинающий"
        elif self.year_of_study == 2:
            return "Развивающийся"
        elif self.year_of_study in [3, 4, 5]:
            return "Продвинутый"
        return "Не указано"

    def __str__(self):
        return f"{self.user.username} - Profile"