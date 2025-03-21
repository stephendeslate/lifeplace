# backend/core/domains/events/admin.py
from django.contrib import admin

from .models import EventType


@admin.register(EventType)
class EventTypeAdmin(admin.ModelAdmin):
    """Admin configuration for EventType model"""
    list_display = ('name', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'is_active')
        }),
    )