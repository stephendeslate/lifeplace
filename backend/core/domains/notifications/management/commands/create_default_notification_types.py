# backend/core/domains/notifications/management/commands/create_default_notification_types.py
from core.domains.notifications.models import NotificationTemplate, NotificationType
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Create default notification types and templates'

    def handle(self, *args, **kwargs):
        # Create default notification types
        notification_types = [
            # System notifications
            {
                'code': 'SYSTEM_ANNOUNCEMENT',
                'name': 'System Announcement',
                'description': 'Important system-wide announcements',
                'category': 'SYSTEM',
                'icon': 'announcement',
                'color': '#1976d2',
            },
            # Event notifications
            {
                'code': 'EVENT_CREATED',
                'name': 'Event Created',
                'description': 'A new event has been created',
                'category': 'EVENT',
                'icon': 'event',
                'color': '#2196f3',
            },
            {
                'code': 'EVENT_CONFIRMED',
                'name': 'Event Confirmed',
                'description': 'An event has been confirmed',
                'category': 'EVENT',
                'icon': 'check_circle',
                'color': '#4caf50',
            },
            # Task notifications
            {
                'code': 'TASK_ASSIGNED',
                'name': 'Task Assigned',
                'description': 'A task has been assigned to you',
                'category': 'TASK',
                'icon': 'assignment',
                'color': '#ff9800',
            },
            {
                'code': 'TASK_DUE',
                'name': 'Task Due Soon',
                'description': 'A task is due soon',
                'category': 'TASK',
                'icon': 'access_time',
                'color': '#f44336',
            },
            {
                'code': 'TASK_COMPLETED',
                'name': 'Task Completed',
                'description': 'A task has been completed',
                'category': 'TASK',
                'icon': 'task_alt',
                'color': '#4caf50',
            },
            # Payment notifications
            {
                'code': 'PAYMENT_RECEIVED',
                'name': 'Payment Received',
                'description': 'A payment has been received',
                'category': 'PAYMENT',
                'icon': 'payments',
                'color': '#4caf50',
            },
            {
                'code': 'PAYMENT_DUE',
                'name': 'Payment Due',
                'description': 'A payment is due soon',
                'category': 'PAYMENT',
                'icon': 'payment',
                'color': '#f44336',
            },
            # Contract notifications
            {
                'code': 'CONTRACT_SENT',
                'name': 'Contract Sent',
                'description': 'A contract has been sent to the client',
                'category': 'CONTRACT',
                'icon': 'description',
                'color': '#2196f3',
            },
            {
                'code': 'CONTRACT_SIGNED',
                'name': 'Contract Signed',
                'description': 'A contract has been signed',
                'category': 'CONTRACT',
                'icon': 'fact_check',
                'color': '#4caf50',
            },
            # Client notifications
            {
                'code': 'CLIENT_CREATED',
                'name': 'New Client',
                'description': 'A new client has been created',
                'category': 'CLIENT',
                'icon': 'person_add',
                'color': '#2196f3',
            },
        ]

        created_count = 0
        updated_count = 0

        for type_data in notification_types:
            obj, created = NotificationType.objects.update_or_create(
                code=type_data['code'],
                defaults=type_data
            )
            if created:
                created_count += 1
            else:
                updated_count += 1
                
            # Create a basic template for each type
            template, _ = NotificationTemplate.objects.update_or_create(
                notification_type=obj,
                defaults={
                    'title': obj.name,
                    'content': f'You have a new {obj.name.lower()}.',
                    'short_content': f'New {obj.name.lower()}',
                    'email_subject': f'{obj.name} Notification',
                    'email_body': f'<p>You have a new {obj.name.lower()}.</p><p>Please check your account for details.</p>',
                    'is_active': True
                }
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {created_count} notification types and updated {updated_count} existing types'
            )
        )