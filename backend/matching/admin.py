from django.contrib import admin
from .models import Subject, UserSubject, Swipe, Match

admin.site.register(Subject)
admin.site.register(UserSubject)
admin.site.register(Swipe)
admin.site.register(Match)