# backend/core/domains/workflows/serializers.py
from core.domains.communications.serializers import EmailTemplateSerializer
from core.domains.events.serializers import EventTypeSerializer
from django.db import transaction
from rest_framework import serializers

from .exceptions import EmailTemplateRequired
from .models import WorkflowStage, WorkflowTemplate


class WorkflowStageSerializer(serializers.ModelSerializer):
    """Serializer for WorkflowStage model"""
    stage_display = serializers.CharField(source='get_stage_display', read_only=True)
    
    class Meta:
        model = WorkflowStage
        fields = [
            'id', 'template', 'name', 'stage', 'stage_display', 'order',
            'is_automated', 'automation_type', 'trigger_time',
            'email_template', 'task_description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate stage data"""
        # If stage is automated, ensure proper configuration
        if data.get('is_automated', False):
            automation_type = data.get('automation_type', '')
            
            if not automation_type:
                raise serializers.ValidationError({
                    'automation_type': 'Automation type is required when is_automated is True'
                })
            
            # For email automation, ensure email_template is provided
            if automation_type == 'EMAIL' and not data.get('email_template'):
                raise EmailTemplateRequired()
            
            # Validate trigger_time if provided
            trigger_time = data.get('trigger_time', '')
            if not trigger_time:
                raise serializers.ValidationError({
                    'trigger_time': 'Trigger time is required when is_automated is True'
                })
        
        return data


class WorkflowStageDetailSerializer(WorkflowStageSerializer):
    """Detailed serializer for WorkflowStage including related objects"""
    email_template = EmailTemplateSerializer(read_only=True)


class WorkflowTemplateSerializer(serializers.ModelSerializer):
    """Serializer for WorkflowTemplate model"""
    
    class Meta:
        model = WorkflowTemplate
        fields = [
            'id', 'name', 'description', 'event_type', 
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class WorkflowTemplateDetailSerializer(WorkflowTemplateSerializer):
    """Detailed serializer for WorkflowTemplate including related objects"""
    event_type = EventTypeSerializer(read_only=True)
    stages = WorkflowStageDetailSerializer(many=True, read_only=True)
    
    class Meta(WorkflowTemplateSerializer.Meta):
        fields = WorkflowTemplateSerializer.Meta.fields + ['stages']


class WorkflowTemplateWithStagesSerializer(WorkflowTemplateSerializer):
    """Serializer for WorkflowTemplate with nested stages for create/update operations"""
    stages = WorkflowStageSerializer(many=True, required=False)
    
    class Meta(WorkflowTemplateSerializer.Meta):
        fields = WorkflowTemplateSerializer.Meta.fields + ['stages']
    
    @transaction.atomic
    def create(self, validated_data):
        stages_data = validated_data.pop('stages', [])
        template = WorkflowTemplate.objects.create(**validated_data)
        
        # Create stages if provided
        for stage_data in stages_data:
            WorkflowStage.objects.create(template=template, **stage_data)
            
        return template
    
    @transaction.atomic
    def update(self, instance, validated_data):
        stages_data = validated_data.pop('stages', None)
        
        # Update template fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # If stages provided, replace all existing stages
        if stages_data is not None:
            # Delete existing stages
            instance.stages.all().delete()
            
            # Create new stages
            for stage_data in stages_data:
                WorkflowStage.objects.create(template=instance, **stage_data)
        
        return instance