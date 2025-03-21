# backend/core/domains/events/models.py
from core.utils.models import BaseModel
from django.db import models


class EventType(BaseModel):
    """Types of events that can be organized"""
    name = models.CharField(max_length=100)
    description = models.TextField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name