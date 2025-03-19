# backend/core/domains/communications/serializers.py
from rest_framework import serializers

from .models import EmailRecord, EmailTemplate


class EmailTemplateSerializer(serializers.ModelSerializer):
    """Serializer for email templates"""
    class Meta:
        model = EmailTemplate
        fields = ['id', 'name', 'subject', 'body', 'attachments', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        """
        Check that the template name is unique (case insensitive)
        """
        if EmailTemplate.objects.filter(name__iexact=value).exclude(id=self.instance.id if self.instance else None).exists():
            raise serializers.ValidationError("An email template with this name already exists.")
        return value


class EmailRecordSerializer(serializers.ModelSerializer):
    """Serializer for email records"""
    client_email = serializers.EmailField(source='client.email', read_only=True)
    sent_by_name = serializers.CharField(source='sent_by.get_full_name', read_only=True)
    
    class Meta:
        model = EmailRecord
        fields = [
            'id', 'name', 'subject', 'body', 'attachments', 
            'client', 'client_email', 'event', 'sent_at', 
            'sent_by', 'sent_by_name', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PreviewEmailTemplateSerializer(serializers.Serializer):
    """Serializer for previewing email templates with sample data"""
    template_id = serializers.IntegerField()
    context_data = serializers.JSONField(required=False, default=dict)