"""
ASGI config for studymatch project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
import sys
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'studymatch.settings')

# Добавляем путь к приложению chat
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'chat'))

try:
    from chat.routing import websocket_urlpatterns
except ImportError as e:
    print(f"Import error: {e}")
    websocket_urlpatterns = []

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})