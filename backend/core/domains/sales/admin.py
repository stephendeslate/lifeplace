# backend/core/domains/sales/admin.py
from django.contrib import admin

from .models import EventQuote, QuoteActivity, QuoteLineItem, QuoteTemplate


class QuoteLineItemInline(admin.TabularInline):
    """Inline admin for quote line items"""
    model = QuoteLineItem
    extra = 0
    fields = ['description', 'quantity', 'unit_price', 'total', 'product']
    readonly_fields = ['total']


class QuoteActivityInline(admin.TabularInline):
    """Inline admin for quote activities"""
    model = QuoteActivity
    extra = 0
    fields = ['action', 'action_by', 'notes', 'created_at']
    readonly_fields = ['action', 'action_by', 'notes', 'created_at']
    can_delete = False


@admin.register(EventQuote)
class EventQuoteAdmin(admin.ModelAdmin):
    """Admin for EventQuote to check if quotes are being created"""
    list_display = ['id', 'event', 'version', 'status', 'total_amount', 'template', 'created_at']
    list_filter = ['status', 'created_at', 'template']
    search_fields = ['event__id', 'event__name']
    readonly_fields = ['created_at', 'updated_at', 'version']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('event', 'template', 'version', 'status')
        }),
        ('Amounts', {
            'fields': ('subtotal', 'tax_amount', 'discount_amount', 'total_amount')
        }),
        ('Dates', {
            'fields': ('valid_until', 'sent_at', 'accepted_at', 'rejected_at', 'created_at', 'updated_at')
        }),
        ('Details', {
            'fields': ('notes', 'created_by'),
            'classes': ('collapse',)
        })
    )
    
    inlines = [QuoteLineItemInline, QuoteActivityInline]
    
    def get_queryset(self, request):
        """Optimize query with select_related"""
        qs = super().get_queryset(request)
        return qs.select_related('event', 'template', 'created_by')


@admin.register(QuoteTemplate)
class QuoteTemplateAdmin(admin.ModelAdmin):
    """Admin for QuoteTemplate"""
    list_display = ['name', 'event_type', 'is_active', 'default_validity_days']
    list_filter = ['is_active', 'event_type']
    search_fields = ['name']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'event_type', 'is_active')
        }),
        ('Settings', {
            'fields': ('default_validity_days', 'has_multiple_options', 'default_tax_rate')
        }),
        ('Content', {
            'fields': ('introduction', 'terms_and_conditions'),
            'classes': ('collapse',)
        })
    )


@admin.register(QuoteActivity)
class QuoteActivityAdmin(admin.ModelAdmin):
    """Admin for QuoteActivity to track what's happening"""
    list_display = ['quote', 'action', 'action_by', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['quote__id', 'notes']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        """Optimize query with select_related"""
        qs = super().get_queryset(request)
        return qs.select_related('quote', 'action_by')