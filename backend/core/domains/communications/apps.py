# backend/core/domains/communications/apps.py
from django.apps import AppConfig


class CommunicationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core.domains.communications'
    label = 'communications'
    verbose_name = 'Communications'