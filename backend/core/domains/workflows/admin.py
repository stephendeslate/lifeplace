# backend/core/domains/workflows/admin.py
from django.contrib import admin

from .models import WorkflowStage, WorkflowTemplate


class WorkflowStageInline(admin.TabularInline):
    """Inline admin for WorkflowStages"""
    model = WorkflowStage
    extra = 1
    ordering = ['stage', 'order']
    readonly_fields = ['created_at', 'updated_at']
    fields = ['name', 'stage', 'order', 'is_automated', 'automation_type', 
              'trigger_time', 'email_template', 'task_description', 'created_at', 'updated_at']


@admin.register(WorkflowTemplate)
class WorkflowTemplateAdmin(admin.ModelAdmin):
    """Admin configuration for WorkflowTemplate model"""
    list_display = ('name', 'event_type', 'is_active', 'created_at')
    list_filter = ('is_active', 'event_type')
    search_fields = ('name', 'description')
    readonly_fields = ['created_at', 'updated_at']
    inlines = [WorkflowStageInline]
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'event_type', 'is_active')
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(WorkflowStage)
class WorkflowStageAdmin(admin.ModelAdmin):
    """Admin configuration for WorkflowStage model"""
    list_display = ('name', 'template', 'stage', 'order', 'is_automated')
    list_filter = ('template', 'stage', 'is_automated')
    search_fields = ('name', 'task_description')
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        (None, {
            'fields': ('template', 'name', 'stage', 'order')
        }),
        ('Automation', {
            'fields': ('is_automated', 'automation_type', 'trigger_time', 'email_template')
        }),
        ('Task Details', {
            'fields': ('task_description',)
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at')
        }),
    )