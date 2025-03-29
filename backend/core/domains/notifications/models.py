# backend/core/domains/notifications/models.py
from core.utils.models import BaseModel
from django.conf import settings
from django.db import models


class NotificationType(BaseModel):
    """Defines types of notifications that can be sent"""
    code = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, 
        choices=[
            ('SYSTEM', 'System'),
            ('EVENT', 'Event'),
            ('TASK', 'Task'),
            ('PAYMENT', 'Payment'),
            ('CLIENT', 'Client'),
            ('CONTRACT', 'Contract'),
        ],
        default='SYSTEM'
    )
    icon = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name


class NotificationTemplate(BaseModel):
    """Templates for notification content"""
    notification_type = models.ForeignKey(NotificationType, on_delete=models.CASCADE, related_name='templates')
    title = models.CharField(max_length=255)
    content = models.TextField()
    short_content = models.CharField(max_length=255, blank=True)
    email_subject = models.CharField(max_length=255, blank=True)
    email_body = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.notification_type.name} - {self.title}"


class NotificationPreference(BaseModel):
    """User preferences for receiving notifications"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notification_preferences')
    email_enabled = models.BooleanField(default=True)
    in_app_enabled = models.BooleanField(default=True)
    
    # Delivery preferences by category
    system_notifications = models.BooleanField(default=True)
    event_notifications = models.BooleanField(default=True)
    task_notifications = models.BooleanField(default=True)
    payment_notifications = models.BooleanField(default=True)
    client_notifications = models.BooleanField(default=True)
    contract_notifications = models.BooleanField(default=True)
    
    # Optional: detailed preferences for specific notification types
    disabled_types = models.ManyToManyField(
        NotificationType, 
        blank=True,
        related_name='users_disabled'
    )
    
    def __str__(self):
        return f"Preferences for {self.user.email}"
    
    def is_type_enabled(self, notification_type):
        """Check if a specific notification type is enabled for this user"""
        if not self.is_category_enabled(notification_type.category):
            return False
        return not self.disabled_types.filter(id=notification_type.id).exists()
    
    def is_category_enabled(self, category):
        """Check if a notification category is enabled for this user"""
        category_map = {
            'SYSTEM': self.system_notifications,
            'EVENT': self.event_notifications,
            'TASK': self.task_notifications,
            'PAYMENT': self.payment_notifications,
            'CLIENT': self.client_notifications,
            'CONTRACT': self.contract_notifications,
        }
        return category_map.get(category, True)


class Notification(BaseModel):
    """Individual notifications sent to users"""
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.ForeignKey(
        NotificationType, 
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=255)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Action/Target references
    action_url = models.CharField(max_length=255, blank=True)
    
    # Content references (optional)
    content_type = models.CharField(max_length=100, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    
    # Email status
    is_emailed = models.BooleanField(default=False)
    emailed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.notification_type.name} for {self.recipient.email}"