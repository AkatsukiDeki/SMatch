# chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import ChatRoom, Message
from django.contrib.auth.models import User


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.chat_room_id = self.scope['url_route']['kwargs']['chat_room_id']
            self.room_group_name = f'chat_{self.chat_room_id}'

            # Проверяем существование чат-комнаты
            room_exists = await self.chat_room_exists(self.chat_room_id)
            if not room_exists:
                await self.close()
                return

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
        except Exception as e:
            print(f"WebSocket connect error: {e}")
            await self.close()

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        except Exception as e:
            print(f"WebSocket disconnect error: {e}")

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json.get('message', '').strip()
            username = text_data_json.get('username', '').strip()

            if not message or not username:
                await self.send(text_data=json.dumps({
                    'error': 'Message and username are required'
                }))
                return

            # Сохраняем сообщение в БД
            success = await self.save_message(username, self.chat_room_id, message)

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
                    'username': username
                }
            )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON format'
            }))
        except Exception as e:
            print(f"WebSocket receive error: {e}")
            await self.send(text_data=json.dumps({
                'error': 'Internal server error'
            }))

    @sync_to_async
    def chat_room_exists(self, chat_room_id):
        try:
            return ChatRoom.objects.filter(id=chat_room_id, is_active=True).exists()
        except Exception:
            return False

    @sync_to_async
    def save_message(self, username, chat_room_id, content):
        try:
            user = User.objects.get(username=username)
            chat_room = ChatRoom.objects.get(id=chat_room_id, is_active=True)

            Message.objects.create(
                chat_room=chat_room,
                sender=user,
                content=content
            )
            return True
        except User.DoesNotExist:
            print(f"User {username} does not exist")
            return False
        except ChatRoom.DoesNotExist:
            print(f"Chat room {chat_room_id} does not exist")
            return False
        except Exception as e:
            print(f"Error saving message: {e}")
            return False

    async def chat_message(self, event):
        try:
            await self.send(text_data=json.dumps({
                'message': event['message'],
                'username': event['username']
            }))
        except Exception as e:
            print(f"Error sending message: {e}")