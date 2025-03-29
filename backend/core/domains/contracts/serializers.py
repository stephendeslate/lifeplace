# backend/core/domains/contracts/serializers.py
from core.domains.events.basic_serializers import EventTypeSerializer
from core.domains.events.serializers import EventSerializer
from core.domains.users.serializers import UserSerializer
from rest_framework import serializers

from .basic_serializers import ContractTemplateSerializer, EventContractSerializer
from .models import ContractTemplate, EventContract


class ContractTemplateDetailSerializer(ContractTemplateSerializer):
    """Detailed serializer for ContractTemplate including related objects"""
    event_type = EventTypeSerializer(read_only=True)
    
    class Meta(ContractTemplateSerializer.Meta):
        fields = ContractTemplateSerializer.Meta.fields + [
            'content', 'variables', 'sections'
        ]


class EventContractDetailSerializer(EventContractSerializer):
    """Detailed serializer for EventContract including related objects"""
    event = EventSerializer(read_only=True)
    template = ContractTemplateSerializer(read_only=True)
    signed_by = UserSerializer(read_only=True)
    
    class Meta(EventContractSerializer.Meta):
        fields = EventContractSerializer.Meta.fields + [
            'content', 'signature_data', 'witness_name', 'witness_signature'
        ]


class ContractSignatureSerializer(serializers.Serializer):
    """Serializer for contract signing"""
    signature_data = serializers.CharField(required=True)
    witness_name = serializers.CharField(required=False, allow_blank=True)
    witness_signature = serializers.CharField(required=False, allow_blank=True)


class ContractTemplateCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating contract templates"""
    class Meta:
        model = ContractTemplate
        fields = [
            'name', 'description', 'event_type', 'content', 
            'variables', 'requires_signature', 'sections'
        ]

    def validate_variables(self, value):
        """Validate variables is a list"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Variables must be a list")
        return value

    def validate_sections(self, value):
        """Validate sections is a list"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Sections must be a list")
        return value


class EventContractCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating event contracts"""
    class Meta:
        model = EventContract
        fields = [
            'event', 'template', 'content', 'valid_until'
        ]
    
    def create(self, validated_data):
        """Create a new event contract always in DRAFT status"""
        validated_data['status'] = 'DRAFT'
        return super().create(validated_data)


class EventContractUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating event contracts"""
    class Meta:
        model = EventContract
        fields = [
            'content', 'status', 'valid_until'
        ]
        
    def validate_status(self, value):
        """Validate status transitions"""
        instance = self.instance
        
        # Define valid transitions from each status
        valid_transitions = {
            'DRAFT': ['SENT', 'VOID'],
            'SENT': ['SIGNED', 'EXPIRED', 'VOID'],
            'SIGNED': [],  # Cannot transition from SIGNED
            'EXPIRED': ['VOID'],
            'VOID': []  # Cannot transition from VOID
        }
        
        current_status = instance.status
        
        if value not in valid_transitions[current_status]:
            raise serializers.ValidationError(
                f"Cannot transition from {current_status} to {value}. "
                f"Valid transitions are: {', '.join(valid_transitions[current_status])}"
            )
        
        return value