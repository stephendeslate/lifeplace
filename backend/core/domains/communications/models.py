# backend/core/domains/communications/models.py
from core.utils.models import BaseModel
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class EmailTemplate(BaseModel):
    """Email template model for generating consistent emails"""
    name = models.CharField(max_length=100, unique=True)
    subject = models.CharField(max_length=200)
    body = models.TextField()
    attachments = models.JSONField(default=list, blank=True, help_text="List of attachment references")

    def __str__(self):
        return self.name


class EmailRecord(BaseModel):
    """Record of emails sent through the system"""
    name = models.CharField(max_length=100)
    subject = models.CharField(max_length=200)
    body = models.TextField()
    attachments = models.JSONField(default=list, blank=True)
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_records')
    event = models.CharField(max_length=100, null=True, blank=True)  # Can be null
    sent_at = models.DateTimeField(null=True, blank=True)
    sent_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_emails')
    STATUS_CHOICES = (
        ('SENT', 'Sent'),
        ('FAILED', 'Failed'),
        ('SCHEDULED', 'Scheduled'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')

    def __str__(self):
        return f"{self.name} to {self.client.email} - {self.status}"