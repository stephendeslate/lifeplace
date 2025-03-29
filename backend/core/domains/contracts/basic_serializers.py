# backend/core/domains/contracts/basic_serializers.py
from rest_framework import serializers

from .models import ContractTemplate, EventContract

"""
This module contains minimal serializers for the contracts domain models
that are used by other domains to prevent circular imports.
These serializers should be kept simple and only include essential fields.
"""


class ContractTemplateSerializer(serializers.ModelSerializer):
    """Basic serializer for the ContractTemplate model"""
    
    class Meta:
        model = ContractTemplate
        fields = [
            'id', 'name', 'description', 'event_type', 'requires_signature',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EventContractSerializer(serializers.ModelSerializer):
    """Basic serializer for the EventContract model"""
    template_name = serializers.CharField(source='template.name', read_only=True)
    
    class Meta:
        model = EventContract
        fields = [
            'id', 'event', 'template', 'template_name', 'status',
            'sent_at', 'signed_at', 'signed_by', 'valid_until',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']