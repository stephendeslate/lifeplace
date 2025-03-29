# backend/core/domains/contracts/admin.py
from django.contrib import admin

from .models import ContractTemplate, EventContract


@admin.register(ContractTemplate)
class ContractTemplateAdmin(admin.ModelAdmin):
    """Admin configuration for ContractTemplate model"""
    list_display = ('name', 'event_type', 'requires_signature', 'created_at')
    list_filter = ('requires_signature', 'event_type')
    search_fields = ('name', 'description', 'content')
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'event_type', 'requires_signature')
        }),
        ('Contract Content', {
            'fields': ('content', 'variables', 'sections')
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(EventContract)
class EventContractAdmin(admin.ModelAdmin):
    """Admin configuration for EventContract model"""
    list_display = ('id', 'event', 'template', 'status', 'sent_at', 'signed_at')
    list_filter = ('status', 'template', 'sent_at', 'signed_at')
    search_fields = ('event__name', 'content')
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        (None, {
            'fields': ('event', 'template', 'status', 'valid_until')
        }),
        ('Contract Content', {
            'fields': ('content',)
        }),
        ('Signature Information', {
            'fields': ('sent_at', 'signed_at', 'signed_by', 'signature_data', 
                       'witness_name', 'witness_signature')
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at')
        }),
    )