# users/models.py - ВРЕМЕННАЯ ВЕРСИЯ
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class University(models.Model):
    name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=50, blank=True, default="")  # временно необязательное
    city = models.CharField(max_length=100, blank=True, default="")  # временно необязательное
    website = models.URLField(blank=True, default="")  # временно необязательное
    def __str__(self):
        return self.name


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    # Основная информация
    university = models.ForeignKey(University, on_delete=models.SET_NULL, null=True, blank=True)
    faculty = models.CharField(max_length=100, blank=True)
    year_of_study = models.IntegerField(
        choices=[(1, '1 курс'), (2, '2 курс'), (3, '3 курс'), (4, '4 курс'), (5, '5 курс')],
        null=True, blank=True
    )

    @property
    def study_level(self):
        if self.year_of_study == 1:
            return "Начинающий"
        elif self.year_of_study == 2:
            return "Развивающийся"
        elif self.year_of_study in [3, 4, 5]:
            return "Продвинутый"
        return "Не указано"

    bio = models.TextField(max_length=500, blank=True)
    # Контакты
    telegram = models.CharField(max_length=50, blank=True)
    whatsapp = models.CharField(max_length=50, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    # Настройки
    show_contact_info = models.BooleanField(default=False)
    # ВРЕМЕННО УБИРАЕМ ПРОБЛЕМНЫЕ ПОЛЯ
    # created_at = models.DateTimeField(auto_now_add=True)
    # updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - Profile"

    # Добавим методы для временной замены auto_now
    def save(self, *args, **kwargs):
        # Логика для обновления временных меток может быть добавлена позже
        super().save(*args, **kwargs)