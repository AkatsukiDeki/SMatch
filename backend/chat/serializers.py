from rest_framework import serializers
from core.serializers import SimpleProfileSerializer, get_profile_data
from .models import ChatRoom, Message

class MessageSerializer(serializers.ModelSerializer):
    sender_profile = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_profile', 'content', 'timestamp', 'is_read']
        read_only_fields = ['sender', 'timestamp']

    def get_sender_profile(self, obj):
        profile_data = get_profile_data(obj.sender)
        return SimpleProfileSerializer(profile_data).data if profile_data else None

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
        if request and request.user.is_authenticated:
            return obj.user2.id if obj.user1 == request.user else obj.user1.id
        return None

    def get_other_user_profile(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            other_user = obj.user2 if obj.user1 == request.user else obj.user1
            profile_data = get_profile_data(other_user)
            return SimpleProfileSerializer(profile_data).data if profile_data else None
        return None

    def get_last_message(self, obj):
        last_message = obj.messages.last()
        return MessageSerializer(last_message).data if last_message else None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0