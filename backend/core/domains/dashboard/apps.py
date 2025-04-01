# backend/core/domains/dashboard/apps.py
from django.apps import AppConfig


class DashboardConfig(AppConfig):
    """Configuration for the Dashboard domain"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core.domains.dashboard'
    
    def ready(self):
        """Import signals when the app is ready"""
        # import core.domains.dashboard.signals  # uncomment if signals are added
        pass