from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def debug_urls(request):
    """Отладочная функция для просмотра всех URL-паттернов"""
    from django.urls import get_resolver

    resolver = get_resolver()
    patterns = []

    def extract_patterns(url_patterns, prefix=''):
        for pattern in url_patterns:
            if hasattr(pattern, 'url_patterns'):
                # Это URLResolver (include)
                new_prefix = prefix + str(pattern.pattern)
                extract_patterns(pattern.url_patterns, new_prefix)
            else:
                # Это URLPattern
                full_pattern = prefix + str(pattern.pattern)
                name = getattr(pattern, 'name', 'No name')
                patterns.append(f"{full_pattern} -> {name}")

    extract_patterns(resolver.url_patterns)
    return JsonResponse({'url_patterns': patterns})


# Простая функция для корневого пути
def root_health_check(request):
    return JsonResponse(
        {"status": "StudyMatch API is running", "message": "Use /api/auth/ for authentication endpoints"})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/matching/', include('matching.urls')),
    path('debug/urls/', debug_urls, name='debug_urls'),
    path('', root_health_check, name='root_health_check'),  # Добавляем корневой путь
    path('api/chat/', include('chat.urls')),
    path('api/study-sessions/', include('study_sessions.urls')),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)