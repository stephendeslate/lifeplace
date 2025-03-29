# backend/core/domains/sales/serializers.py
from core.domains.contracts.serializers import ContractTemplateSerializer
from core.domains.events.serializers import EventSerializer, EventTypeSerializer
from core.domains.products.serializers import ProductOptionSerializer
from core.domains.questionnaires.serializers import QuestionnaireSerializer
from core.domains.users.serializers import UserSerializer
from rest_framework import serializers

from .models import (
    EventQuote,
    QuoteActivity,
    QuoteLineItem,
    QuoteOption,
    QuoteOptionItem,
    QuoteReminder,
    QuoteTemplate,
    QuoteTemplateProduct,
)


class QuoteTemplateProductSerializer(serializers.ModelSerializer):
    product_details = ProductOptionSerializer(source='product', read_only=True)
    
    class Meta:
        model = QuoteTemplateProduct
        fields = [
            'id', 'template', 'product', 'product_details', 
            'quantity', 'is_required', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuoteTemplateSerializer(serializers.ModelSerializer):
    event_type_name = serializers.CharField(source='event_type.name', read_only=True)
    products = QuoteTemplateProductSerializer(source='quotetemplateplateproduct_set', many=True, read_only=True)
    contract_templates = ContractTemplateSerializer(many=True, read_only=True)
    questionnaires = QuestionnaireSerializer(many=True, read_only=True)
    
    class Meta:
        model = QuoteTemplate
        fields = [
            'id', 'name', 'introduction', 'event_type', 'event_type_name',
            'terms_and_conditions', 'is_active', 'products', 
            'contract_templates', 'questionnaires', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuoteLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteLineItem
        fields = [
            'id', 'quote', 'description', 'quantity', 'unit_price',
            'tax_rate', 'total', 'product', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuoteOptionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteOptionItem
        fields = [
            'id', 'option', 'description', 'quantity', 'unit_price',
            'total', 'product', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuoteOptionSerializer(serializers.ModelSerializer):
    items = QuoteOptionItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = QuoteOption
        fields = [
            'id', 'quote', 'name', 'description', 'total_price',
            'is_selected', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuoteActivitySerializer(serializers.ModelSerializer):
    action_by_name = serializers.CharField(source='action_by.get_full_name', read_only=True)
    
    class Meta:
        model = QuoteActivity
        fields = [
            'id', 'quote', 'action', 'action_by', 'action_by_name',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuoteReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteReminder
        fields = [
            'id', 'quote', 'scheduled_date', 'is_sent', 'sent_at',
            'message', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EventQuoteSerializer(serializers.ModelSerializer):
    event_details = EventSerializer(source='event', read_only=True)
    template_details = QuoteTemplateSerializer(source='template', read_only=True)
    line_items = QuoteLineItemSerializer(many=True, read_only=True)
    options = QuoteOptionSerializer(many=True, read_only=True)
    activities = QuoteActivitySerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = EventQuote
        fields = [
            'id', 'event', 'event_details', 'template', 'template_details',
            'version', 'status', 'status_display', 'subtotal', 'tax_amount',
            'discount_amount', 'total_amount', 'valid_until', 'sent_at',
            'accepted_at', 'rejected_at', 'rejection_reason', 'notes',
            'terms_and_conditions', 'client_message', 'signature_data',
            'line_items', 'options', 'activities', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'version', 'created_at', 'updated_at']