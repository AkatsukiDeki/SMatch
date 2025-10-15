# users/admin.py
from django.contrib import admin
from .models import University, UserProfile


class UniversityAdmin(admin.ModelAdmin):
    list_display = ['name', 'short_name', 'city']  # Убрали 'website'
    list_filter = ['city']
    search_fields = ['name', 'short_name']


class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'university', 'get_year_of_study', 'faculty']  # Заменили 'study_level' на метод
    list_filter = ['year_of_study', 'university', 'faculty']  # Исправили фильтры
    search_fields = ['user__username', 'faculty', 'bio']

    def get_year_of_study(self, obj):
        return obj.year_of_study

    get_year_of_study.short_description = 'Year of Study'
    get_year_of_study.admin_order_field = 'year_of_study'


admin.site.register(University, UniversityAdmin)
admin.site.register(UserProfile, UserProfileAdmin)