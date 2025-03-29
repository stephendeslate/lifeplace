# core/domains/contracts/models.py
from core.utils.models import BaseModel
from django.db import models


class ContractTemplate(BaseModel):
    """Templates for legal contracts"""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    event_type = models.ForeignKey('events.EventType', on_delete=models.PROTECT, null=True, blank=True)
    content = models.TextField()
    variables = models.JSONField(default=list)
    requires_signature = models.BooleanField(default=True)
    sections = models.JSONField(default=list, help_text="JSON structure of contract sections")
    
    def __str__(self):
        return self.name
        
    def get_sections(self):
        """Returns parsed sections or an empty list"""
        return self.sections or []


class EventContract(BaseModel):
    """Legal contract associated with an event"""
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='contracts')
    template = models.ForeignKey(ContractTemplate, on_delete=models.PROTECT)
    status = models.CharField(max_length=20, choices=[
        ('DRAFT', 'Draft'),
        ('SENT', 'Sent'),
        ('SIGNED', 'Signed'),
        ('EXPIRED', 'Expired'),
        ('VOID', 'Void')
    ])
    content = models.TextField()  # Final rendered contract content
    sent_at = models.DateTimeField(null=True, blank=True)
    signed_at = models.DateTimeField(null=True, blank=True)
    signed_by = models.ForeignKey(
        'users.User', 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='signed_contracts'
    )
    signature_data = models.TextField(null=True, blank=True)  # Store signature image/data
    valid_until = models.DateField(null=True, blank=True)
    witness_name = models.CharField(max_length=255, blank=True)
    witness_signature = models.TextField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Contract for Event {self.event.id} ({self.status})"