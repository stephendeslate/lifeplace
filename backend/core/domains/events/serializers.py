# backend/core/domains/events/serializers.py
from rest_framework import serializers

from .models import EventType


class EventTypeSerializer(serializers.ModelSerializer):
    """Serializer for EventType model"""
    
    class Meta:
        model = EventType
        fields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']