# chat/serializers.py
from rest_framework import serializers
from .models import ChatRoom, Message


class SimpleProfileSerializer(serializers.Serializer):
    """Упрощенный сериализатор профиля для чата"""
    id = serializers.IntegerField(source='user.id')
    username = serializers.CharField(source='user.username')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    faculty = serializers.CharField()
    year_of_study = serializers.IntegerField()
    study_level = serializers.CharField()  # ДОБАВЛЯЕМ
    bio = serializers.CharField()


class MessageSerializer(serializers.ModelSerializer):
    sender_profile = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_profile', 'content', 'timestamp', 'is_read']
        read_only_fields = ['sender', 'timestamp']

    def get_sender_profile(self, obj):
        try:
            return SimpleProfileSerializer(obj.sender.profile).data
        except:
            return None


class ChatRoomSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    other_user_profile = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ['id', 'user1', 'user2', 'other_user', 'other_user_profile',
                  'last_message', 'unread_count', 'created_at', 'is_active']

    def get_other_user(self, obj):
        request = self.context.get('request')
        if request and request.user:
            if obj.user1 == request.user:
                return obj.user2.id
            else:
                return obj.user1.id
        return None

    def get_other_user_profile(self, obj):
        request = self.context.get('request')
        if request and request.user:
            try:
                if obj.user1 == request.user:
                    return SimpleProfileSerializer(obj.user2.profile).data
                else:
                    return SimpleProfileSerializer(obj.user1.profile).data
            except:
                return None
        return None

    def get_last_message(self, obj):
        last_message = obj.messages.last()
        if last_message:
            return MessageSerializer(last_message).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0