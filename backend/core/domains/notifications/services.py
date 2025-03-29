# backend/core/domains/notifications/services.py
from datetime import datetime

from core.domains.communications.services import EmailService
from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.template import Context, Template
from django.utils import timezone

from .exceptions import (
    InvalidNotificationDataException,
    NotificationNotFoundException,
    NotificationPreferenceNotFoundException,
    NotificationTemplateNotFoundException,
    NotificationTypeNotFoundException,
)
from .models import (
    Notification,
    NotificationPreference,
    NotificationTemplate,
    NotificationType,
)


class NotificationService:
    """Service for handling notification operations"""

    @staticmethod
    def get_notifications(user, is_read=None, notification_type=None, limit=None):
        """Get notifications for a user with optional filtering"""
        query = Q(recipient=user)
        
        if is_read is not None:
            query &= Q(is_read=is_read)
            
        if notification_type is not None:
            query &= Q(notification_type__code=notification_type)
            
        notifications = Notification.objects.filter(query).select_related(
            'notification_type', 'recipient'
        ).order_by('-created_at')
        
        if limit:
            notifications = notifications[:limit]
            
        return notifications
    
    @staticmethod
    def get_notification_by_id(id, user=None):
        """Get a notification by ID, optionally filtered by user"""
        query = Q(id=id)
        if user:
            query &= Q(recipient=user)
            
        try:
            return Notification.objects.select_related(
                'notification_type', 'recipient'
            ).get(query)
        except Notification.DoesNotExist:
            raise NotificationNotFoundException()
    
    @staticmethod
    def mark_as_read(notification_id, user=None):
        """Mark a notification as read"""
        with transaction.atomic():
            notification = NotificationService.get_notification_by_id(notification_id, user)
            if not notification.is_read:
                notification.is_read = True
                notification.read_at = timezone.now()
                notification.save(update_fields=['is_read', 'read_at', 'updated_at'])
            return notification
    
    @staticmethod
    def mark_as_unread(notification_id, user=None):
        """Mark a notification as unread"""
        with transaction.atomic():
            notification = NotificationService.get_notification_by_id(notification_id, user)
            if notification.is_read:
                notification.is_read = False
                notification.read_at = None
                notification.save(update_fields=['is_read', 'read_at', 'updated_at'])
            return notification
    
    @staticmethod
    def mark_all_as_read(user):
        """Mark all notifications as read for a user"""
        with transaction.atomic():
            now = timezone.now()
            updated = Notification.objects.filter(
                recipient=user, 
                is_read=False
            ).update(
                is_read=True, 
                read_at=now,
                updated_at=now
            )
            return updated
    
    @staticmethod
    def delete_notification(notification_id, user=None):
        """Delete a notification"""
        notification = NotificationService.get_notification_by_id(notification_id, user)
        notification.delete()
        return True
    
    @staticmethod
    def create_notification(recipient, notification_type_code, context=None, email=False):
        """
        Create a new notification
        
        Args:
            recipient: User to receive the notification
            notification_type_code: Code of the notification type
            context: Dictionary of context variables for templates
            email: Whether to send an email notification
        
        Returns:
            Created notification object
        """
        if not context:
            context = {}
            
        # Get notification type
        try:
            notification_type = NotificationType.objects.get(code=notification_type_code, is_active=True)
        except NotificationType.DoesNotExist:
            raise NotificationTypeNotFoundException(f"Notification type with code {notification_type_code} not found")
            
        # Check user notification preferences
        try:
            preferences = NotificationPreference.objects.get(user=recipient)
        except NotificationPreference.DoesNotExist:
            # Create default preferences if none exist
            preferences = NotificationPreference.objects.create(user=recipient)
            
        # Check if this notification type is enabled for the user
        if not preferences.is_type_enabled(notification_type):
            return None
            
        # Get template
        try:
            template = NotificationTemplate.objects.get(
                notification_type=notification_type,
                is_active=True
            )
        except NotificationTemplate.DoesNotExist:
            raise NotificationTemplateNotFoundException()
            
        # Render templates with context
        template_context = Context(context)
        title = Template(template.title).render(template_context)
        content = Template(template.content).render(template_context)
        
        # Create notification
        notification = Notification.objects.create(
            recipient=recipient,
            notification_type=notification_type,
            title=title,
            content=content,
            action_url=context.get('action_url', ''),
            content_type=context.get('content_type', ''),
            object_id=context.get('object_id')
        )
        
        # Send email if enabled for user and requested
        if email and preferences.email_enabled:
            email_subject = Template(template.email_subject or template.title).render(template_context)
            email_body = Template(template.email_body or template.content).render(template_context)
            
            try:
                EmailService.send_notification_email(
                    recipient.email,
                    email_subject,
                    email_body,
                    context
                )
                notification.is_emailed = True
                notification.emailed_at = timezone.now()
                notification.save(update_fields=['is_emailed', 'emailed_at'])
            except Exception as e:
                # Log error but don't fail the notification creation
                print(f"Error sending notification email: {str(e)}")
                
        return notification
    
    @staticmethod
    def bulk_action(user_id, notification_ids, action):
        """Perform bulk actions on multiple notifications"""
        if not notification_ids:
            raise InvalidNotificationDataException("No notification IDs provided")
            
        notifications = Notification.objects.filter(
            recipient_id=user_id,
            id__in=notification_ids
        )
        
        if not notifications.exists():
            raise NotificationNotFoundException("No matching notifications found")
            
        with transaction.atomic():
            if action == 'mark_read':
                now = timezone.now()
                return notifications.filter(is_read=False).update(
                    is_read=True, 
                    read_at=now, 
                    updated_at=now
                )
            elif action == 'mark_unread':
                now = timezone.now()
                return notifications.filter(is_read=True).update(
                    is_read=False, 
                    read_at=None, 
                    updated_at=now
                )
            elif action == 'delete':
                count = notifications.count()
                notifications.delete()
                return count
                
    @staticmethod
    def get_notification_counts(user_id):
        """Get notification counts for a user"""
        total = Notification.objects.filter(recipient_id=user_id).count()
        unread = Notification.objects.filter(recipient_id=user_id, is_read=False).count()
        return {
            'total': total,
            'unread': unread
        }
    
    @staticmethod
    def get_or_create_user_preferences(user_id):
        """Get or create notification preferences for a user"""
        try:
            return NotificationPreference.objects.get(user_id=user_id)
        except NotificationPreference.DoesNotExist:
            return NotificationPreference.objects.create(user_id=user_id)
            
    @staticmethod
    def update_user_preferences(user_id, preference_data):
        """Update notification preferences for a user"""
        with transaction.atomic():
            preferences = NotificationService.get_or_create_user_preferences(user_id)
            
            # Update simple boolean fields
            for field in [
                'email_enabled', 'in_app_enabled',
                'system_notifications', 'event_notifications', 
                'task_notifications', 'payment_notifications',
                'client_notifications', 'contract_notifications'
            ]:
                if field in preference_data:
                    setattr(preferences, field, preference_data[field])
            
            # Update disabled types
            if 'disabled_types' in preference_data:
                preferences.disabled_types.clear()
                if preference_data['disabled_types']:
                    notification_types = NotificationType.objects.filter(
                        id__in=preference_data['disabled_types']
                    )
                    preferences.disabled_types.add(*notification_types)
            
            preferences.save()
            return preferences