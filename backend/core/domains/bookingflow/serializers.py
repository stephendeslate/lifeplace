# backend/core/domains/bookingflow/serializers.py
from core.domains.events.serializers import EventTypeSerializer
from core.domains.products.serializers import ProductOptionSerializer
from core.domains.questionnaires.serializers import QuestionnaireSerializer
from rest_framework import serializers

from .models import (
    BookingFlow,
    BookingStep,
    CustomStepConfiguration,
    DateStepConfiguration,
    ProductStepConfiguration,
    ProductStepItem,
    QuestionnaireStepConfiguration,
)


class BookingFlowSerializer(serializers.ModelSerializer):
    event_type_details = EventTypeSerializer(source='event_type', read_only=True)
    
    class Meta:
        model = BookingFlow
        fields = [
            'id', 'name', 'description', 'event_type', 'event_type_details',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BookingFlowDetailSerializer(serializers.ModelSerializer):
    event_type_details = EventTypeSerializer(source='event_type', read_only=True)
    steps_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BookingFlow
        fields = [
            'id', 'name', 'description', 'event_type', 'event_type_details',
            'is_active', 'steps_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'steps_count']
    
    def get_steps_count(self, obj):
        return obj.steps.count()


class QuestionnaireStepConfigurationSerializer(serializers.ModelSerializer):
    questionnaire_details = QuestionnaireSerializer(source='questionnaire', read_only=True)
    
    class Meta:
        model = QuestionnaireStepConfiguration
        fields = [
            'id', 'questionnaire', 'questionnaire_details', 'require_all_fields',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductStepItemSerializer(serializers.ModelSerializer):
    product_details = ProductOptionSerializer(source='product', read_only=True)
    
    class Meta:
        model = ProductStepItem
        fields = [
            'id', 'product', 'product_details', 'order', 'is_highlighted',
            'custom_price', 'custom_description', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductStepConfigurationSerializer(serializers.ModelSerializer):
    product_items = ProductStepItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = ProductStepConfiguration
        fields = [
            'id', 'min_selection', 'max_selection', 'selection_type',
            'product_items', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'product_items']


class DateStepConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DateStepConfiguration
        fields = [
            'id', 'min_days_in_future', 'max_days_in_future', 'allow_time_selection',
            'buffer_before_event', 'buffer_after_event', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomStepConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomStepConfiguration
        fields = [
            'id', 'html_content', 'use_react_component', 'component_name',
            'component_props', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BookingStepSerializer(serializers.ModelSerializer):
    step_type_display = serializers.CharField(source='get_step_type_display', read_only=True)
    
    class Meta:
        model = BookingStep
        fields = [
            'id', 'booking_flow', 'name', 'step_type', 'step_type_display',
            'description', 'instructions', 'order', 'is_required', 'is_visible',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BookingStepDetailSerializer(serializers.ModelSerializer):
    step_type_display = serializers.CharField(source='get_step_type_display', read_only=True)
    questionnaire_config = QuestionnaireStepConfigurationSerializer(read_only=True)
    product_config = ProductStepConfigurationSerializer(read_only=True)
    date_config = DateStepConfigurationSerializer(read_only=True)
    custom_config = CustomStepConfigurationSerializer(read_only=True)
    
    class Meta:
        model = BookingStep
        fields = [
            'id', 'booking_flow', 'name', 'step_type', 'step_type_display',
            'description', 'instructions', 'order', 'is_required', 'is_visible',
            'questionnaire_config', 'product_config', 'date_config', 'custom_config',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BookingFlowWithStepsSerializer(serializers.ModelSerializer):
    steps = BookingStepSerializer(many=True, read_only=True)
    event_type_details = EventTypeSerializer(source='event_type', read_only=True)
    
    class Meta:
        model = BookingFlow
        fields = [
            'id', 'name', 'description', 'event_type', 'event_type_details',
            'is_active', 'steps', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']