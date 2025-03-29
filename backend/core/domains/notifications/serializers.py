# backend/core/domains/notifications/serializers.py
from rest_framework import serializers

from .models import (
    Notification,
    NotificationPreference,
    NotificationTemplate,
    NotificationType,
)


class NotificationTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationType
        fields = [
            'id', 'code', 'name', 'description', 'category', 
            'icon', 'color', 'is_active', 'created_at', 'updated_at'
        ]


class NotificationTemplateSerializer(serializers.ModelSerializer):
    notification_type_details = NotificationTypeSerializer(source='notification_type', read_only=True)
    
    class Meta:
        model = NotificationTemplate
        fields = [
            'id', 'notification_type', 'notification_type_details',
            'title', 'content', 'short_content', 'email_subject', 
            'email_body', 'is_active', 'created_at', 'updated_at'
        ]


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    disabled_types = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=NotificationType.objects.all(),
        required=False
    )
    
    class Meta:
        model = NotificationPreference
        fields = [
            'id', 'user', 'email_enabled', 'in_app_enabled',
            'system_notifications', 'event_notifications', 
            'task_notifications', 'payment_notifications',
            'client_notifications', 'contract_notifications',
            'disabled_types', 'created_at', 'updated_at'
        ]
        

class NotificationSerializer(serializers.ModelSerializer):
    notification_type_details = NotificationTypeSerializer(source='notification_type', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'notification_type', 'notification_type_details',
            'title', 'content', 'is_read', 'read_at', 'action_url',
            'content_type', 'object_id', 'is_emailed', 'emailed_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['is_emailed', 'emailed_at', 'created_at', 'updated_at']


class NotificationBulkActionSerializer(serializers.Serializer):
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True
    )
    action = serializers.ChoiceField(
        choices=['mark_read', 'mark_unread', 'delete'],
        required=True
    )


class NotificationCountSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    unread = serializers.IntegerField()