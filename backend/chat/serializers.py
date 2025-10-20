# chat/serializers.py
from rest_framework import serializers
from core.serializers import SimpleProfileSerializer
from .models import ChatRoom, Message

class MessageSerializer(serializers.ModelSerializer):
    sender_profile = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_profile', 'content', 'timestamp', 'is_read']
        read_only_fields = ['sender', 'timestamp']

    def get_sender_profile(self, obj):
        try:
            profile_data = {
                'id': obj.sender.id,
                'username': obj.sender.username,
                'first_name': obj.sender.first_name,
                'last_name': obj.sender.last_name,
                'faculty': obj.sender.profile.faculty if hasattr(obj.sender, 'profile') else '',
                'year_of_study': obj.sender.profile.year_of_study if hasattr(obj.sender, 'profile') else None,
                'study_level': obj.sender.profile.study_level if hasattr(obj.sender, 'profile') else '',
                'bio': obj.sender.profile.bio if hasattr(obj.sender, 'profile') else ''
            }
            return SimpleProfileSerializer(profile_data).data
        except Exception as e:
            print(f"Error getting sender profile: {e}")
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
                other_user = obj.user2 if obj.user1 == request.user else obj.user1
                profile_data = {
                    'id': other_user.id,
                    'username': other_user.username,
                    'first_name': other_user.first_name,
                    'last_name': other_user.last_name,
                    'faculty': other_user.profile.faculty if hasattr(other_user, 'profile') else '',
                    'year_of_study': other_user.profile.year_of_study if hasattr(other_user, 'profile') else None,
                    'study_level': other_user.profile.study_level if hasattr(other_user, 'profile') else '',
                    'bio': other_user.profile.bio if hasattr(other_user, 'profile') else ''
                }
                return SimpleProfileSerializer(profile_data).data
            except Exception as e:
                print(f"Error getting other user profile: {e}")
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