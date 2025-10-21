import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatRoom, Message
from django.contrib.auth.models import User
from core.utils import log_websocket_event

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.chat_room_id = self.scope['url_route']['kwargs']['chat_room_id']
            self.room_group_name = f'chat_{self.chat_room_id}'

            # Проверяем аутентификацию
            if not self.scope["user"].is_authenticated:
                await self.close(code=4001)
                return

            # Проверяем существование чат-комнаты
            room_exists = await self.chat_room_exists(self.chat_room_id)
            if not room_exists:
                await self.close(code=4004)
                return

            # Проверяем, что пользователь участник чата
            user_in_room = await self.user_in_chat_room(self.chat_room_id, self.scope["user"].id)
            if not user_in_room:
                await self.close(code=4003)
                return

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
            log_websocket_event(f"Connected to room {self.chat_room_id}")

        except Exception as e:
            log_websocket_event(f"Connect error: {e}", 'error')
            await self.close(code=4000)

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            log_websocket_event(f"Disconnected from room {self.chat_room_id}, code: {close_code}")
        except Exception as e:
            log_websocket_event(f"Disconnect error: {e}", 'error')

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json.get('message', '').strip()
            user_id = self.scope["user"].id

            if not message:
                await self.send(text_data=json.dumps({
                    'error': 'Message is required'
                }))
                return

            # Сохраняем сообщение в БД
            success = await self.save_message(user_id, self.chat_room_id, message)

            if not success:
                await self.send(text_data=json.dumps({
                    'error': 'Failed to save message'
                }))
                return

            # Отправляем сообщение в группу комнаты
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'username': self.scope["user"].username,
                    'user_id': user_id
                }
            )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON format'
            }))
        except Exception as e:
            log_websocket_event(f"Receive error: {e}", 'error')
            await self.send(text_data=json.dumps({
                'error': 'Internal server error'
            }))

    async def chat_message(self, event):
        try:
            await self.send(text_data=json.dumps({
                'message': event['message'],
                'username': event['username'],
                'user_id': event['user_id'],
                'timestamp': str(self.get_current_timestamp())
            }))
        except Exception as e:
            log_websocket_event(f"Error sending message: {e}", 'error')

    @database_sync_to_async
    def chat_room_exists(self, chat_room_id):
        try:
            return ChatRoom.objects.filter(id=chat_room_id, is_active=True).exists()
        except Exception as e:
            log_websocket_event(f"Room existence check error: {e}", 'error')
            return False

    @database_sync_to_async
    def user_in_chat_room(self, chat_room_id, user_id):
        try:
            chat_room = ChatRoom.objects.get(id=chat_room_id)
            return chat_room.user1.id == user_id or chat_room.user2.id == user_id
        except ChatRoom.DoesNotExist:
            return False
        except Exception as e:
            log_websocket_event(f"User in room check error: {e}", 'error')
            return False

    @database_sync_to_async
    def save_message(self, user_id, chat_room_id, content):
        try:
            user = User.objects.get(id=user_id)
            chat_room = ChatRoom.objects.get(id=chat_room_id, is_active=True)

            Message.objects.create(
                chat_room=chat_room,
                sender=user,
                content=content
            )
            return True
        except (User.DoesNotExist, ChatRoom.DoesNotExist) as e:
            log_websocket_event(f"Save message error - not found: {e}", 'error')
            return False
        except Exception as e:
            log_websocket_event(f"Save message error: {e}", 'error')
            return False

    @database_sync_to_async
    def get_current_timestamp(self):
        from django.utils import timezone
        return timezone.now()