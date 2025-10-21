from django.contrib import admin
from .models import University, UserProfile, UserAvatar

@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ['name', 'short_name', 'city']
    list_filter = ['city']
    search_fields = ['name', 'short_name']

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'university', 'get_year_of_study', 'faculty']
    list_filter = ['year_of_study', 'university', 'faculty']
    search_fields = ['user__username', 'faculty', 'bio']

    def get_year_of_study(self, obj):
        return obj.year_of_study
    get_year_of_study.short_description = 'Year of Study'
    get_year_of_study.admin_order_field = 'year_of_study'

@admin.register(UserAvatar)
class UserAvatarAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at']
    search_fields = ['user__username']