# studymatch/asgi.py - ПРАВИЛЬНАЯ ВЕРСИЯ
import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# Настраиваем Django ДО импорта WebSocket
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'studymatch.settings')
django.setup()

# Получаем Django приложение
django_application = get_asgi_application()

# Импортируем WebSocket routing ПОСЛЕ настройки Django
try:
    from chat.routing import websocket_urlpatterns
    print("✅ WebSocket URLs loaded successfully")
except ImportError as e:
    print(f"❌ Error loading WebSocket URLs: {e}")
    # Создаем пустые patterns если не удалось загрузить
    websocket_urlpatterns = []

application = ProtocolTypeRouter({
    "http": django_application,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})