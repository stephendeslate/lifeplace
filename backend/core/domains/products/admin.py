# backend/core/domains/products/admin.py
from django.contrib import admin

from .models import Discount, ProductOption


@admin.register(ProductOption)
class ProductOptionAdmin(admin.ModelAdmin):
    """Admin configuration for ProductOption model"""
    list_display = ('name', 'type', 'base_price', 'currency', 'tax_rate', 'is_active')
    list_filter = ('type', 'is_active', 'currency', 'has_excess_hours', 'allow_multiple')
    search_fields = ('name', 'description')
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'type', 'is_active')
        }),
        ('Pricing', {
            'fields': ('base_price', 'currency', 'tax_rate')
        }),
        ('Options', {
            'fields': ('event_type', 'allow_multiple')
        }),
        ('Excess Hours', {
            'classes': ('collapse',),
            'fields': ('has_excess_hours', 'included_hours', 'excess_hour_price')
        }),
    )
    list_per_page = 20


@admin.register(Discount)
class DiscountAdmin(admin.ModelAdmin):
    """Admin configuration for Discount model"""
    list_display = ('code', 'discount_type', 'value', 'is_active', 'valid_from', 
                    'valid_until', 'current_uses', 'max_uses', 'is_valid')
    list_filter = ('is_active', 'discount_type', 'valid_from', 'valid_until')
    search_fields = ('code', 'description')
    filter_horizontal = ('applicable_products',)
    readonly_fields = ('current_uses', 'created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('code', 'description', 'is_active')
        }),
        ('Discount Details', {
            'fields': ('discount_type', 'value')
        }),
        ('Validity', {
            'fields': ('valid_from', 'valid_until', 'max_uses', 'current_uses')
        }),
        ('Products', {
            'fields': ('applicable_products',)
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at')
        }),
    )
    list_per_page = 20

    def is_valid(self, obj):
        """Show whether the discount is currently valid"""
        return obj.is_valid()
    is_valid.boolean = True
    is_valid.short_description = "Valid"