from django.contrib.auth.models import User
from django.db import models

class Subject(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class University(models.Model):
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    website = models.URLField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.city})"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    faculty = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    university = models.ForeignKey(University, on_delete=models.SET_NULL, null=True, blank=True)
    subjects = models.ManyToManyField(Subject)
    study_level = models.CharField(max_length=50,
                                   choices=[('bachelor', 'Бакалавр'), ('master', 'Магистр'), ('phd', 'Аспирант')])

    def __str__(self):
        return f"{self.user.username} - {self.university}"