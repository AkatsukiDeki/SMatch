from django.contrib import admin
from .models import Subject, UserSubject, Swipe, Match

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'icon']
    search_fields = ['name']

admin.site.register(UserSubject)
admin.site.register(Swipe)
admin.site.register(Match)