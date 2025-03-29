# backend/core/domains/notifications/signals.py
from core.domains.contracts.models import EventContract
from core.domains.events.models import Event, EventTask
from core.domains.payments.models import Payment
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver

from .models import NotificationPreference
from .services import NotificationService

User = get_user_model()

@receiver(post_save, sender=User)
def create_notification_preferences(sender, instance, created, **kwargs):
    """Create default notification preferences for new users"""
    if created:
        NotificationPreference.objects.create(user=instance)

# Event-related notification signals
@receiver(post_save, sender=Event)
def event_notifications(sender, instance, created, update_fields, **kwargs):
    """Generate notifications for event changes"""
    # Only process for status changes
    if not created and (update_fields is None or 'status' in update_fields):
        if instance.status == 'CONFIRMED':
            # Notify admins about event confirmation
            for admin in User.objects.filter(is_staff=True, is_active=True):
                NotificationService.create_notification(
                    recipient=admin,
                    notification_type_code='EVENT_CONFIRMED',
                    context={
                        'event_id': instance.id,
                        'event_name': instance.name,
                        'client_name': instance.client_name,
                        'action_url': f'/events/{instance.id}',
                        'content_type': 'event',
                        'object_id': instance.id
                    },
                    email=True
                )

# Task-related notification signals
@receiver(post_save, sender=EventTask)
def task_notifications(sender, instance, created, update_fields, **kwargs):
    """Generate notifications for task changes"""
    # New task assignment
    if created and instance.assigned_to:
        NotificationService.create_notification(
            recipient=instance.assigned_to,
            notification_type_code='TASK_ASSIGNED',
            context={
                'task_id': instance.id,
                'task_title': instance.title,
                'event_name': instance.event.name,
                'due_date': instance.due_date,
                'action_url': f'/events/{instance.event.id}',
                'content_type': 'task',
                'object_id': instance.id
            },
            email=True
        )
    
    # Task status change
    if not created and (update_fields is None or 'status' in update_fields):
        if instance.status == 'COMPLETED' and instance.event:
            # Notify the client if the task is visible to them
            if instance.is_visible_to_client and instance.event.client:
                NotificationService.create_notification(
                    recipient=instance.event.client,
                    notification_type_code='TASK_COMPLETED',
                    context={
                        'task_title': instance.title,
                        'event_name': instance.event.name,
                        'action_url': f'/client/events/{instance.event.id}',
                        'content_type': 'task',
                        'object_id': instance.id
                    },
                    email=True
                )

# Contract-related notification signals
@receiver(post_save, sender=EventContract)
def contract_notifications(sender, instance, created, update_fields, **kwargs):
    """Generate notifications for contract changes"""
    if not created and (update_fields is None or 'status' in update_fields):
        if instance.status == 'SIGNED':
            # Notify admins about contract signing
            for admin in User.objects.filter(is_staff=True, is_active=True):
                NotificationService.create_notification(
                    recipient=admin,
                    notification_type_code='CONTRACT_SIGNED',
                    context={
                        'contract_id': instance.id,
                        'contract_name': instance.template_name,
                        'event_name': instance.event.name if isinstance(instance.event, Event) else 'Unknown Event',
                        'client_name': instance.event.client_name if isinstance(instance.event, Event) else 'Unknown Client',
                        'action_url': f'/contracts/{instance.id}',
                        'content_type': 'contract',
                        'object_id': instance.id
                    },
                    email=True
                )

# Payment-related notification signals
@receiver(post_save, sender=Payment)
def payment_notifications(sender, instance, created, update_fields, **kwargs):
    """Generate notifications for payment changes"""
    if not created and (update_fields is None or 'status' in update_fields):
        if instance.status == 'COMPLETED':
            # Notify admins about payment completion
            for admin in User.objects.filter(is_staff=True, is_active=True):
                NotificationService.create_notification(
                    recipient=admin,
                    notification_type_code='PAYMENT_RECEIVED',
                    context={
                        'payment_id': instance.id,
                        'payment_number': instance.payment_number,
                        'amount': instance.amount,
                        'event_name': instance.event.name if isinstance(instance.event, Event) else 'Unknown Event',
                        'client_name': instance.event.client_name if isinstance(instance.event, Event) else 'Unknown Client',
                        'action_url': f'/payments/{instance.id}',
                        'content_type': 'payment',
                        'object_id': instance.id
                    },
                    email=True
                )